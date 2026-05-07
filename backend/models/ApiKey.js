const mongoose = require('mongoose');

const ApiKeySchema = new mongoose.Schema({
  provider: { 
    type: String, 
    required: true, 
    enum: ['GEMINI', 'DEEPSEEK', 'OPENAI', 'PEXELS', 'PIXABAY', 'GOOGLE_TTS', 'LTX-2', 'WAN'] 
  },
  key: { type: String, required: true, unique: true },
  label: { type: String }, // For identifying account (e.g. "Account 1")
  status: { type: String, enum: ['ACTIVE', 'EXHAUSTED', 'FAILED'], default: 'ACTIVE' },
  isFixedMaster: { type: Boolean, default: false }, // For Fixed Gemini Brain
  usageCount: { type: Number, default: 0 },
  lastUsed: { type: Date },
  errorLogs: [{ 
    message: String, 
    timestamp: { type: Date, default: Date.now } 
  }]
}, { timestamps: true });

module.exports = mongoose.model('ApiKey', ApiKeySchema);
