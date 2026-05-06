const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  businessName: { type: String, required: true },
  niche: { type: String },
  location: { type: String },
  language: { type: String, default: 'en' },
  status: { type: String, enum: ['ACTIVE', 'PAUSED'], default: 'ACTIVE' },
  mode: { type: String, enum: ['MANUAL', 'AUTO'], default: 'MANUAL' },
  
  // Limits set by Agency
  limits: {
    dailyVideos: { type: Number, default: 1 },
    dailyReels: { type: Number, default: 2 },
    gapBetweenPosts: { type: Number, default: 4 }, // Hours
    monthlyCreditBudget: { type: Number, default: 0 }
  },
  
  // Pipeline state for this business
  pipeline: {
    currentStep: { type: String },
    lastPostAt: { type: Date },
    activeContent: {
      script: String,
      title: String,
      description: String,
      tags: String,
      videoUrl: String
    }
  },
  
  socialLinks: [{
    platform: { type: String },
    handle: { type: String },
    isConnected: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Client', ClientSchema);
