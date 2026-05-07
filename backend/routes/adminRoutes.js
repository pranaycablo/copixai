const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const SystemSettings = require('../models/SystemSettings');
const SecurityService = require('../services/SecurityService');
const VideoPipeline = require('../models/VideoPipeline');
const verifyToken = require('../middleware/authMiddleware');

// ── ADMIN ROLE CHECK MIDDLEWARE ──
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.profile.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ error: 'Access Denied: Admin privileges required' });
  }
};

router.use(verifyToken);
router.use(verifyAdmin);

// ── GLOBAL SETTINGS (Niches, Pricing, Referral, APIs) ──
router.get('/settings', async (req, res) => {
  try {
    let settings = await SystemSettings.findOne({ configType: 'GLOBAL' });
    if (!settings) {
      settings = new SystemSettings({ niches: ['UGC', 'Ads', 'Marketing', 'Cinematic', 'Branding'] });
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/settings', async (req, res) => {
  try {
    const settings = await SystemSettings.findOneAndUpdate(
      { configType: 'GLOBAL' },
      req.body,
      { new: true, upsert: true }
    );
    res.json({ message: 'Global settings updated', settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── REVENUE & FINANCIALS (Daily Profits/Tax) ──
router.get('/financials', async (req, res) => {
  try {
    const summary = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalTax: { $sum: "$taxAmount" },
          totalNetProfit: { $sum: "$netProfit" },
          totalCost: { $sum: "$costToCompany" }
        }
      }
    ]);

    res.json({
      summary: summary[0] || { totalRevenue: 0, totalTax: 0, totalNetProfit: 0, totalCost: 0 },
      transactions: await Transaction.find().sort({ createdAt: -1 }).limit(100)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── USER MANAGEMENT ──
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users/:id/credentials', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // In production, these should be encrypted. For Admin, we show them as identity packets.
    res.json({
      credentials: {
        email: user.auth.email,
        phone: user.auth.phone,
        lastLogin: user.security.lastLogin,
        ip: user.security.lastIp,
        plan: user.subscription.planId
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users/:id/history', async (req, res) => {
  try {
    const history = await VideoPipeline.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(200);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/:id/block', async (req, res) => {
  try {
    const { isBlocked, reason } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, {
      'security.isBlocked': isBlocked,
      'security.blockReason': reason
    }, { new: true });
    res.json({ message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/users/:id/notify', async (req, res) => {
    try {
        const { message } = req.body;
        // In production, this would use FCM/Firebase
        console.log(`[Admin Notification to ${req.params.id}]: ${message}`);
        res.json({ message: 'Notification sent successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── TICKETING SYSTEM ──
router.get('/tickets', async (req, res) => {
    try {
        const tickets = await Ticket.find().populate('userId', 'profile.name').sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/tickets/:id/resolve', async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(req.params.id, { status: 'RESOLVED' }, { new: true });
        res.json({ message: 'Ticket resolved', ticket });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── PAYMENT LOGS ──
router.get('/payments', async (req, res) => {
    try {
        const payments = await Payment.find().populate('userId', 'profile.name').sort({ createdAt: -1 });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── AI VAULT (Credentials Management) ──
router.post('/vault', async (req, res) => {
    try {
        // Vault items can be stored in SystemSettings or a dedicated Vault model.
        // For simplicity and centralized config, we use SystemSettings.
        const { category, provider, key, email, password } = req.body;
        const settings = await SystemSettings.findOne({ configType: 'GLOBAL' });
        
        if (category === 'API') {
            settings.apiKeys[provider.toLowerCase()] = key;
        }
        // Logic for Bot storage could go here
        
        await settings.save();
        res.json({ message: 'Vault item secured', settings });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── DASHBOARD OVERVIEW STATS ──
router.get('/stats', async (req, res) => {
  try {
    const statsAgg = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          revenue: { $sum: "$amount" },
          netProfit: { $sum: "$netProfit" }
        }
      }
    ]);
    
    const financialStats = statsAgg[0] || { revenue: 0, netProfit: 0 };
    const totalVideos = await VideoPipeline.countDocuments();
    const activeNow = await User.countDocuments({ 'usageStats.lastReset': { $gte: new Date(Date.now() - 24*60*60*1000) } });
    
    res.json({
      users: await User.countDocuments(),
      revenue: financialStats.revenue,
      totalVideos: totalVideos,
      activeNow: activeNow,
      netProfit: financialStats.netProfit
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── SYSTEM MANAGEMENT (Hard Reset & Seeding) ──
router.post('/system-reset', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      console.log(`[ADMIN] Dropping collection: ${collection.collectionName}`);
      await collection.deleteMany({});
    }
    
    // Seed Default System Settings
    const defaultSettings = new SystemSettings({
      configType: 'GLOBAL',
      niches: ['Technology', 'Finance', 'Lifestyle', 'Gaming', 'Education', 'Business', 'Health & Fitness', 'Travel', 'Food & Cooking', 'Fashion & Beauty', 'Motivation', 'AI News']
    });
    await defaultSettings.save();

    res.json({ message: 'SYSTEM HARD RESET COMPLETE. All data cleared and default plans seeded.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

