const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
  configType: { type: String, default: 'GLOBAL' }, // Always 'GLOBAL'
  
  // PLANS & PRICING
  plans: {
    beginner: { price: { type: Number, default: 499 } },
    creator: { price: { type: Number, default: 1499 } },
    business: { price: { type: Number, default: 4999 } },
    agency: { price: { type: Number, default: 9999 } }
  },

  // REFERRAL LOGIC
  referral: {
    requiredShares: { type: Number, default: 5 },
    freeDaysReward: { type: Number, default: 3 }
  },

  // NICHE CATEGORIES
  niches: [String],

  // API KEYS & SECRETS
  apiKeys: {
    firebase: { type: String },
    googleLanguage: { type: String },
    gemini: { type: String },
    paymentGateway: { type: String }
  },

  // SYSTEM STATS (Aggregated)
  dailyStats: [{
    date: { type: String }, // YYYY-MM-DD
    revenue: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    netProfit: { type: Number, default: 0 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('SystemSettings', SystemSettingsSchema);
