const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');

/**
 * Razorpay Webhook Handler
 * Securely updates user plan after successful payment
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === signature) {
    console.log('[PAYMENT] Webhook verified. Processing event:', req.body.event);
    
    if (req.body.event === 'payment.captured') {
      const payment = req.body.payload.payment.entity;
      const userId = payment.notes.userId;
      const planId = payment.notes.planId;

      const user = await User.findById(userId);
      if (user) {
        user.subscription.planId = planId;
        user.subscription.creditsRemaining += (planId === 'gro' ? 30 : planId === 'pro' ? 60 : 100);
        user.billing.transactionHistory.push({
          amount: payment.amount / 100,
          planId: planId,
          status: 'SUCCESS',
          date: new Date()
        });
        await user.save();
        console.log(`[PAYMENT] Plan ${planId} activated for user ${userId}`);
      }
    }
    res.json({ status: 'ok' });
  } else {
    res.status(400).send('Invalid signature');
  }
});

module.exports = router;
