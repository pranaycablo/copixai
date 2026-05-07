const mongoose = require('mongoose');

const VideoPipelineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  platformsToPost: [{ type: String }], // e.g. ['youtube', 'instagram']
  videoType: { type: String, enum: ['LONG', 'REEL'], default: 'REEL' },
  bundleType: { type: String, enum: ['SINGLE', 'FULL_PACK'], default: 'SINGLE' }, // FULL_PACK = 1 Video + 2 Reels
  durationSeconds: { type: Number, default: 0 },
  
  status: { 
    type: String, 
    enum: [
      'QUEUED', 
      'THINKING',
      'SCRIPTING', 
      'GATHERING_ASSETS', 
      'RENDERING', 
      'READY_TO_POST', 
      'POSTED_LIVE', 
      'SCHEDULED',
      'DISTRIBUTING',
      'FAILED'
    ], 
    default: 'QUEUED' 
  },
  productionFidelity: { type: Number, default: 0.99 }, // 99% Quality Assurance
  fidelityScore: { type: Number, default: 100 }, // 100% Output Priority Target
  engineSelection: { 
    type: String, 
    enum: ['STANDARD', 'LTX2_ULTRA', 'WAN_CINEMATIC', 'HYBRID_AUTO'], 
    default: 'HYBRID_AUTO' 
  },
  computeCost: { type: Number, default: 0 }, // Exact AI API cost for this video
  triggerSource: { type: String, enum: ['MANUAL', 'AUTO_WORKER'], default: 'MANUAL' },
  autoPilot: { type: Boolean, default: false },
  
  // Segmentation Logic (The ₹0 Engine Core)
  totalSegments: { type: Number, default: 0 },
  completedSegments: { type: Number, default: 0 },
  
  segmentsData: [{
    segmentIndex: Number,
    textOverlay: String,
    audioUrl: String, // Path to generated TTS
    videoClipUrl: String, // Path to scraped stock video
    isCompleted: { type: Boolean, default: false }
  }],
  
  // Intelligence Layer Outputs
  aiSuggestedPostTime: { type: Date },
  actualPostTime: { type: Date },
  
  seoData: {
    hook: String,
    kickLine: String,
    hashtags: [String],
    description: String,
    thumbnailConcept: String
  },
  growthStrategy: {
    subscriberTriggers: [String],
    competitorAnalysis: String
  },

  finalOutputUrls: {
    longVideo: { type: String },
    shorts: [{ type: String }],
    thumbnail: { type: String }
  },

  // Marketplace 50/50 Tracking
  usedDigitalTwinId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Master AI Mind Plan
  masterBrainPlan: { type: mongoose.Schema.Types.Mixed },

  // Viral Intelligence (V3 Pro)
  viralScore: { type: Number, min: 0, max: 100 },
  viralAnalysis: { type: String },

  // Auto-Healer (V3 Pro)
  autoHealAttemptCount: { type: Number, default: 0 },
  isAutoHealed: { type: Boolean, default: false },

  // Error logging for Auto-Healer
  lastError: { type: String },
  
  // Custom Metadata
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

// High-Performance Query Indexes
VideoPipelineSchema.index({ userId: 1, status: 1 });
VideoPipelineSchema.index({ createdAt: -1 });
VideoPipelineSchema.index({ "finalOutputUrls.shorts": 1 }, { sparse: true });

module.exports = mongoose.model('VideoPipeline', VideoPipelineSchema);

