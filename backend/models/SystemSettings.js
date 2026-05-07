const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
  // CONTENT MANAGEMENT
  aboutUs: { type: String, default: 'HeroAi is an autonomous marketing agency ecosystem.' },
  termsAndConditions: { type: String, default: 'Terms of service apply.' },
  privacyPolicy: { type: String, default: 'Your privacy is protected.' },

  // PAYMENT GATEWAY KEYS
  gateways: {
    razorpay: {
      keyId: String,
      keySecret: String,
      isActive: { type: Boolean, default: true }
    },
    stripe: {
      publishableKey: String,
      secretKey: String,
      isActive: { type: Boolean, default: false }
    }
  },

  // GLOBAL QUOTAS
  dailyFreeTokenQuota: { type: Number, default: 1 },
  referralRewardDays: { type: Number, default: 3 },
  referralRewardTokens: { type: Number, default: 3 }
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);
