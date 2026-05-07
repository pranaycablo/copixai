const express = require('express');
const router = express.Router();
const SystemSettings = require('../models/SystemSettings');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

/**
 * GET Global Settings (Public)
 */
router.get('/public', async (req, res) => {
  try {
    const settings = await SystemSettings.findOne();
    // Exclude secrets for public view
    const publicSettings = {
      aboutUs: settings.aboutUs,
      termsAndConditions: settings.termsAndConditions,
      privacyPolicy: settings.privacyPolicy,
      razorpayKeyId: settings.gateways.razorpay.keyId
    };
    res.json(publicSettings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch public settings.' });
  }
});

/**
 * GET Full Settings (Admin Only)
 */
router.get('/admin', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const settings = await SystemSettings.findOne() || await SystemSettings.create({});
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin settings.' });
  }
});

/**
 * UPDATE Settings (Admin Only)
 */
router.post('/update', verifyToken, verifyAdmin, async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    if (!settings) settings = new SystemSettings();
    
    Object.assign(settings, req.body);
    await settings.save();
    res.json({ message: 'Settings updated successfully!', settings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

module.exports = router;
