const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');

// Middleware to ensure user is an Agency
const verifyAgency = (req, res, next) => {
  if (req.user && req.user.profile.role === 'AGENCY') {
    next();
  } else {
    res.status(403).json({ error: 'Access Denied: Agency privileges required' });
  }
};

router.use(verifyToken);
router.use(verifyAgency);

// ── GET MANAGED USERS (BUSINESSES) ──
router.get('/managed-users', async (req, res) => {
  try {
    const agency = await User.findById(req.user.id).populate('profile.managedUsers');
    res.json(agency.profile.managedUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── LINK A BUSINESS TO AGENCY ──
router.post('/link-user', async (req, res) => {
  const { email } = req.body;
  try {
    const businessUser = await User.findOne({ 'auth.email': email, 'profile.role': 'BUSINESS' });
    if (!businessUser) return res.status(404).json({ error: 'Business user not found with this email' });

    const agency = await User.findById(req.user.id);
    if (agency.profile.managedUsers.includes(businessUser._id)) {
      return res.status(400).json({ error: 'Business already managed by this agency' });
    }

    agency.profile.managedUsers.push(businessUser._id);
    businessUser.profile.parentAgencyId = agency._id;

    await agency.save();
    await businessUser.save();

    res.json({ message: 'Business successfully linked to Agency', businessUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET AGENCY CREDITS & STATS ──
router.get('/stats', async (req, res) => {
  try {
    const agency = await User.findById(req.user.id);
    res.json({
      creditsRemaining: agency.subscription.creditsRemaining,
      managedCount: agency.profile.managedUsers.length,
      planId: agency.subscription.planId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

