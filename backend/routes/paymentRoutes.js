const express = require('express');
const router = express.Router();
const PaymentService = require('../services/PaymentService');
const User = require('../models/User');
const verifyToken = require('../middleware/authMiddleware');

// Create Order
router.post('/create-order', verifyToken, async (req, res) => {
    try {
        const { amount, planId } = req.body;
        const order = await PaymentService.createOrder(amount);
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Capture Order & Upgrade User
router.post('/capture-order', verifyToken, async (req, res) => {
    try {
        const { orderId, planId } = req.body;
        const capture = await PaymentService.captureOrder(orderId);
        
        if (capture.status === 'COMPLETED') {
            const user = req.user;
            
            // Map Plans to Credits/Quotas
            const plans = {
                'pro': { credits: 100, dailyVideoQuota: 3, dailyReelQuota: 10 },
                'business': { credits: 500, dailyVideoQuota: 15, dailyReelQuota: 50 },
                'agency': { credits: 2000, dailyVideoQuota: 75, dailyReelQuota: 250 }
            };

            const selectedPlan = plans[planId.toLowerCase()] || plans['pro'];
            
            user.subscription.planId = planId;
            user.subscription.creditsRemaining += selectedPlan.credits;
            user.subscription.dailyVideoQuota = selectedPlan.dailyVideoQuota;
            user.subscription.dailyReelQuota = selectedPlan.dailyReelQuota;
            user.subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Days
            
            await user.save();
            
            res.json({ message: 'Payment Successful', user });
        } else {
            res.status(400).json({ error: 'Payment not completed' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
