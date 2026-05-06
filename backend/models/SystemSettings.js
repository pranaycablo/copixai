const mongoose = require('mongoose');

const SystemSettingsSchema = new mongoose.Schema({
  configType: { type: String, default: 'GLOBAL' }, // Always 'GLOBAL'
  
  // PLANS & PRICING (Moved to AdminConfig.geoPricing)

  // REFERRAL LOGIC
  referral: {
    requiredShares: { type: Number, default: 5 },
    freeDaysReward: { type: Number, default: 3 }
  },

  // NICHE CATEGORIES
  niches: [String],

  // API KEYS & SECRETS (Centralized for non-AI tools)
  apiKeys: {
    firebase: { type: String },
    geolocation: { type: String, default: 'free_internal' },
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
