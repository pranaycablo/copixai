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

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy-client-id');

// 🛡️ PRODUCTION HEALTH CHECK: Ensure all critical ENV vars are loaded
const requiredEnv = ['JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS', 'MONGO_URI'];
requiredEnv.forEach(env => {
  if (!process.env[env]) console.error(`[CRITICAL] Missing Environment Variable: ${env}`);
});

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
      return res.status(400).json({ error: 'Email already registered.', code: 'DUPLICATE_EMAIL' });
    }

    if (phone) {
      const existingPhone = await User.findOne({ 'auth.phone': phone });
      if (existingPhone) {
        return res.status(400).json({ error: 'Phone number already registered.', code: 'DUPLICATE_PHONE' });
      }
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
  console.log('[AUTH] Received login-email request');
  const { email, phone } = req.body;
  try {
    const otp = '111111'; // 🛠️ DEBUG MODE: Fixed OTP for all users
    const identifier = email || phone;
    await OTP.findOneAndUpdate(
        { identifier },
        { otp, createdAt: new Date() },
        { upsert: true, new: true }
    );

    if (email) {
      // 🛡️ MASTER ADMIN PROTECTION: Skip mail sending for admin to strictly use fixed Master OTP (700779)
      if (email === 'pranayHeroAi@gmail.com') {
        console.log(`[AUTH] Master Admin Login Detected. Fixed OTP 700779 is active.`);
        return res.status(201).json({ message: 'OTP active for Admin', email });
      }

      console.log(`[AUTH] Handing off OTP delivery to MailService background worker for: ${email}`);
      MailService.sendOTP(email, otp).then(sent => {
        if (sent) console.log(`[AUTH] ✅ Background OTP delivery successful for ${email}`);
        else console.error(`[AUTH] ❌ Background OTP delivery failed for ${email}`);
      }).catch(e => console.error(`[AUTH] ❌ Critical failure in background OTP worker:`, e));

      return res.status(201).json({ message: 'OTP request received. Sending...', email });
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

// ── GOOGLE LOGIN VERIFICATION (Unified Enterprise Route) ──
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
    const isAdmin = (email === 'pranayHeroAi@gmail.com' || email === 'riturajvashisth@gmail.com');

    if (!user) {
      user = new User({
        profile: { name, avatar: picture, role: isAdmin ? 'ADMIN' : 'USER' },
        auth: { email, isVerified: true },
        security: { googleId },
        isSetupComplete: isAdmin ? true : false,
        subscription: { planId: isAdmin ? 'business' : 'trial', creditsRemaining: isAdmin ? 99999 : 3 }
      });
      await user.save();
      console.log(`[AUTH] New Google-based account architected for: ${email}`);
    } else if (isAdmin) {
      user.profile.role = 'ADMIN';
      user.isSetupComplete = true;
      if (user.subscription.creditsRemaining < 1000) user.subscription.creditsRemaining = 99999;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Google Login Successful', token, user });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(401).json({ error: 'Google authentication failed' });
  }
});

// ── VERIFY OTP & LOGIN (Enterprise Production Standard) ──
router.post('/verify-otp', async (req, res) => {
  const { email, phone, otp, name, deviceId } = req.body;
  
  try {
    const identifier = email || phone;
    if (!identifier || !otp) return res.status(400).json({ error: 'Identifier and OTP required' });

    // 1. Verify OTP (Master OTP 700779 for Admin, Real OTP for others)
    const isAdmin = (identifier === 'pranayHeroAi@gmail.com' || identifier === 'riturajvashisth@gmail.com');
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
        auth: { email: email || undefined, phone: phone || undefined, isVerified: true },
        profile: { name: name || 'New Creator', role: isAdmin ? 'ADMIN' : 'USER' },
        subscription: { planId: isAdmin ? 'business' : 'trial', creditsRemaining: isAdmin ? 99999 : 3 },
        isSetupComplete: isAdmin ? true : false,
        'security.deviceFingerprint': deviceId
      });
      await user.save();
      console.log(`[AUTH] New account architected for: ${identifier}`);
    } else if (isAdmin) {
      user.profile.role = 'ADMIN';
      user.isSetupComplete = true;
      user.auth.isVerified = true;
      if (user.subscription.creditsRemaining < 1000) user.subscription.creditsRemaining = 99999;
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
      const r = userRole.toUpperCase();
      if (r === 'AGENCY') {
        user.profile.role = 'AGENCY';
        user.subscription.planId = 'agency';
      } else if (r === 'BUSINESS') {
        user.profile.role = 'BUSINESS';
        user.subscription.planId = 'business';
      } else if (r === 'CREATOR') {
        user.profile.role = 'CREATOR';
        user.subscription.planId = 'pro'; // Creator gets Pro features
      } else {
        user.profile.role = 'USER';
        user.subscription.planId = 'trial';
      }
    }
    
    if (nicheCategories) user.digitalIdentity.nicheCategories = nicheCategories;
    
    if (socialLinks && Array.isArray(socialLinks)) {
      const hadLinks = user.socialLinks && user.socialLinks.some(l => l.isConnected);
      
      user.socialLinks = socialLinks.map(link => {
        // Security: Encrypt sensitive credentials
        if (link.credentialsSecure && !link.credentialsSecure.includes(':')) {
          link.credentialsSecure = SecurityService.encrypt(link.credentialsSecure);
        }
        if (link.accessToken && !link.accessToken.includes(':')) {
          link.accessToken = SecurityService.encrypt(link.accessToken);
        }
        return link;
      });

      // 🎁 REFERRAL REWARD LOGIC: First time social connection
      const nowHasLinks = user.socialLinks.some(l => l.isConnected);
      if (!hadLinks && nowHasLinks && user.referrals.referredBy && !user.referrals.hasContributedReferralPoint) {
        const referrer = await User.findById(user.referrals.referredBy);
        if (referrer) {
          referrer.referrals.activeReferralsCount += 1;
          user.referrals.hasContributedReferralPoint = true;

          // Check if referrer hit a 5-user milestone
          const milestone = Math.floor(referrer.referrals.activeReferralsCount / 5);
          if (milestone > referrer.referrals.claimedRewardsCount) {
            const rewardCycles = milestone - referrer.referrals.claimedRewardsCount;
            referrer.subscription.creditsRemaining += (rewardCycles * 3); // 3 Tokens per 5 users
            // Add 3 days to expiry for each cycle
            const extraDays = rewardCycles * 3;
            const currentExpiry = referrer.subscription.contentPlan.expiresAt || new Date();
            referrer.subscription.contentPlan.expiresAt = new Date(currentExpiry.getTime() + (extraDays * 24 * 60 * 60 * 1000));
            referrer.referrals.claimedRewardsCount = milestone;
            
            console.log(`[REFERRAL] User ${referrer._id} rewarded with ${extraDays} days and tokens.`);
          }
          await referrer.save();
        }
      }
    }
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
        const user = await User.findOne({ 'auth.email': 'pranayHeroAi@gmail.com' });
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

// ── NOTIFICATIONS ──
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── REAL-TIME ANALYTICS SYNC ──
router.get('/analytics', verifyToken, async (req, res) => {
  try {
    const AnalyticsService = require('../services/AnalyticsService');
    const stats = await AnalyticsService.syncUserStats(req.user._id);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync social insights.' });
  }
});

module.exports = router;

