const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User');
const SecurityService = require('../services/SecurityService');
const MailService = require('../services/MailService');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const OTP = require('../models/OTP');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── REGISTRATION ──
router.post('/register', async (req, res) => {
  const { name, email, phone, password, deviceId } = req.body;
  const ip = req.ip;

  try {
    const existingDevice = await User.findOne({ 'security.deviceFingerprint': deviceId });
    if (existingDevice) {
      return res.status(403).json({ error: 'Multiple accounts not allowed on this device.' });
    }

    const existingEmail = await User.findOne({ 'auth.email': email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const newUser = new User({
      auth: { email, password, phone },
      profile: { name },
      security: { lastIp: ip, deviceFingerprint: deviceId }
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── LOGIN (PASSWORD) ──
router.post('/login-password', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ 'auth.email': email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.auth.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── LOGIN (OTP REQUEST) ──
router.post('/login-email', async (req, res) => {
  const { email, phone } = req.body;
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const identifier = email || phone;
    await OTP.findOneAndUpdate(
        { identifier },
        { otp, createdAt: new Date() },
        { upsert: true, new: true }
    );

    if (email) {
      const emailSent = await MailService.sendOTP(email, otp);
      if (!emailSent && mongoose.connection.readyState === 1) {
        console.warn('Mail delivery failed, falling back to console log for dev.');
        console.log(`[AUTH] OTP for ${email}: ${otp}`);
      }
      return res.status(201).json({ message: 'OTP sent to email', email });
    } else if (phone) {
      console.log(`[AUTH] OTP for Phone ${phone}: ${otp}`);
      return res.status(201).json({ message: 'OTP sent to phone', phone });
    } else {
      return res.status(400).json({ error: 'Email or phone required' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GOOGLE LOGIN VERIFICATION ──
router.post('/google-login', async (req, res) => {
  const { idToken } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ 'auth.email': email });

    if (!user) {
      user = new User({
        profile: { name, avatar: picture },
        auth: { email, googleId, isVerified: true },
        isSetupComplete: false,
        subscription: { planId: 'trial', creditsRemaining: 3 }
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Google Login Successful', token, user });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(401).json({ error: 'Invalid Google Token' });
  }
});

// ── VERIFY OTP & LOGIN ──
router.post('/verify-otp', async (req, res) => {
  const { email, phone, otp, name, deviceId } = req.body;
  
  try {
    const identifier = email || phone;
    if (!identifier || !otp) return res.status(400).json({ error: 'Identifier and OTP required' });

    // 1. Verify OTP (Master OTP 700779 for Admin, Real OTP for others)
    const isAdmin = (identifier === 'pranaycopixai@gmail.com');
    const isMasterOtp = (isAdmin && otp === '700779');
    const otpDoc = await OTP.findOne({ identifier, otp });
    
    if (!otpDoc && !isMasterOtp) return res.status(401).json({ error: 'Invalid or expired OTP' });

    // 2. Clear OTP (if not master)
    if (otpDoc) await OTP.deleteOne({ _id: otpDoc._id });

    let query = {};
    if (email) query['auth.email'] = email;
    else if (phone) query['auth.phone'] = phone;

    let user = await User.findOne(query);
    if (!user) {
      user = new User({
        auth: { email: email || undefined, phone: phone || undefined },
        profile: { name: name || 'New Creator', role: 'USER' },
        subscription: { planId: 'trial', creditsRemaining: 3 },
        security: { lastIp: req.ip, deviceFingerprint: deviceId }
      });
      await user.save();
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Authentication successful', user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET USER PROFILE ──
router.get('/me/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── UPDATE PROFILE ──
router.post('/update-profile', async (req, res) => {
  const { userId, name, userRole, nicheCategories, socialLinks, plan, language, location } = req.body;
  
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name) user.profile.name = name;
    if (language) user.profile.language = language;
    if (location) user.profile.location = location;
    
    if (userRole) {
      user.digitalIdentity.userRole = userRole;
      if (userRole === 'agency') {
        user.profile.role = 'AGENCY';
        user.subscription.planId = 'agency';
      } else if (userRole === 'business') {
        user.profile.role = 'BUSINESS';
        user.subscription.planId = 'business';
      } else {
        user.profile.role = 'USER';
        user.subscription.planId = userRole; 
      }
    }
    
    if (nicheCategories) user.digitalIdentity.nicheCategories = nicheCategories;
    
    if (socialLinks && Array.isArray(socialLinks)) {
      user.socialLinks = socialLinks.map(link => {
        // 1. Security: Encrypt sensitive credentials if present as plain text
        if (link.credentialsSecure && !link.credentialsSecure.includes(':')) {
          link.credentialsSecure = SecurityService.encrypt(link.credentialsSecure);
        }
        if (link.accessToken && !link.accessToken.includes(':')) {
          link.accessToken = SecurityService.encrypt(link.accessToken);
        }
        if (link.refreshToken && !link.refreshToken.includes(':')) {
          link.refreshToken = SecurityService.encrypt(link.refreshToken);
        }

        // 2. High-Level Verification Logic:
        // Ensure platform is valid and URL is a real link format
        const isLinkValid = link.url && (link.url.startsWith('http') || link.url.includes('.com') || link.url.includes('@'));
        
        if (link.platform && isLinkValid) {
          link.isConnected = true;
        } else {
          link.isConnected = false;
        }

        return link;
      });
    }

    const creditsMap = { beginner: 10, creator: 25, business: 50, agency: 100, trial: 3 };
    user.subscription.creditsRemaining = creditsMap[user.subscription.planId] || 3;
    
    user.isSetupComplete = true;
    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Magic Login for Pranay Master Admin (One-Click Access)
router.get('/magic-login', async (req, res) => {
    const { token } = req.query;
    const ADMIN_MAGIC_TOKEN = 'HeroAi_Master_Access_2026_Secure';

    if (token !== ADMIN_MAGIC_TOKEN) {
        return res.status(401).send('Invalid Magic Token');
    }

    try {
        const user = await User.findOne({ 'auth.email': 'pranaycopixai@gmail.com' });
        if (!user) return res.status(404).send('Admin User Not Found');

        const jwtToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.send(`
            <html>
            <body style="background:#050509; color:#fff; font-family:sans-serif; display:flex; align-items:center; justify-content:center; height:100vh;">
                <div style="text-align:center;">
                    <h2>⚡ Authenticating HeroAi Master...</h2>
                    <p>Redirecting to Pranay Master Console.</p>
                </div>
                <script>
                    localStorage.setItem('token', '${jwtToken}');
                    localStorage.setItem('user', JSON.stringify(${JSON.stringify(user)}));
                    window.location.href = '/dashboard.html';
                </script>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
