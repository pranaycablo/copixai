const mongoose = require('mongoose');

const AiVaultSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['API_KEY', 'BROWSER_GMAIL', 'PROXY'], 
    required: true 
  },
  category: { // New: To distinguish between API and Automation Bots
    type: String,
    enum: ['API', 'BOT'],
    default: 'API'
  },
  module: {
    type: String, 
    enum: ['SCRIPT_AI', 'VOICE_AI', 'CLIP_AI', 'THUMBNAIL_AI', 'BROWSER_AUTOMATION'],
    required: true
  },
  provider: { 
    type: String, 
    required: true // e.g., 'Groq', 'Gemini', 'GoogleAccount'
  },
  isFixedMaster: { // New: For Master Brain Fixed Gemini
    type: Boolean,
    default: false
  },
  credentials: {
    apiKey: { type: String }, // Encrypted
    email: { type: String },
    passwordEncrypted: { type: String }
  },
  status: { 
    type: String, 
    enum: ['ACTIVE', 'EXHAUSTED', 'COOLING_DOWN', 'BANNED', 'RED'], // Added RED for UI
    default: 'ACTIVE' 
  },
  priority: {
    type: Number,
    default: 1 // 1 is highest priority (Free APIs should be 1)
  },
  usage: {
    dailyCount: { type: Number, default: 0 },
    dailyLimit: { type: Number, default: 1000 },
    totalCostIncurred: { type: Number, default: 0 },
    costPerCallEstimate: { type: Number, default: 0.00 }
  },
  health: {
    averageResponseTimeMs: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 }
  },
  lastUsedAt: { type: Date },
  resetAt: { type: Date } 
}, { timestamps: true });

module.exports = mongoose.model('AiVault', AiVaultSchema);

