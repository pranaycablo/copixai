const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  auth: {
    email: { type: String, unique: true, index: true, sparse: true },
    password: { type: String }, // Used if no OAuth
    googleId: { type: String, index: true, sparse: true },
    phone: { type: String, unique: true, index: true, sparse: true }
  },
  profile: {
    name: { type: String },
    role: { type: String, enum: ['USER', 'ADMIN', 'AGENCY', 'BUSINESS'], default: 'USER' },
    parentAgencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    managedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // For Agency
    studioPreferences: {
      autoEnhanceScript: { type: Boolean, default: true },
      manualApprovalRequired: { type: Boolean, default: true },
      defaultTone: { type: String, default: 'Professional' }
    },
    countryCode: { type: String, default: 'IN' }, 
    currency: { type: String, default: 'INR' },
    language: { type: String, default: 'en' },
    location: { type: String }
  },
  referrals: {
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pendingSignups: { type: Number, default: 0 }, // Count toward the 5 needed for extra days
    totalReferrals: { type: Number, default: 0 },
    freeDaysEarned: { type: Number, default: 0 }
  },
  subscription: {
    planId: { type: String, enum: ['trial', 'beginner', 'creator', 'business', 'agency'], default: 'trial' },
    status: { type: String, enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'], default: 'ACTIVE' },
    creditsRemaining: { type: Number, default: 3 }, 
    dailyVideoQuota: { type: Number, default: 1 }, // 1 Video per day (Trial)
    dailyReelQuota: { type: Number, default: 2 }, // 2 Reels per day (Trial)
    expiresAt: { type: Date }
  },
  digitalIdentity: {
    voiceCloneId: { type: String }, 
    faceAvatarId: { type: String }, 
    userRole: { type: String }, 
    nicheCategories: [String],
    facePreference: { type: String, enum: ['OWN', 'AUTO'], default: 'AUTO' },
    voicePreference: { type: String, enum: ['OWN', 'AUTO'], default: 'AUTO' },
    faceTrainingImages: [{ url: String, uploadedAt: { type: Date, default: Date.now } }],
    voiceRecordingUrl: { type: String },
    consentToLicenseFace: { type: Boolean, default: false }, // Monetization
    consentToLicenseVoice: { type: Boolean, default: false }, // Monetization
    businessContentChoices: [String], // UGC, Offer, Marketing, Branding
    preferredPostingMode: { type: String, enum: ['MANUAL', 'AUTO'], default: 'MANUAL' }
  },
  digitalTwin: {
    isTrained: { type: Boolean, default: false },
    accuracyScore: { type: Number, default: 0 }, // Target 99.9%
    vocalTimbre: { type: String }, // Voice DNA
    microExpressions: { type: Boolean, default: true }, // V3 Pro High-Fidelity
    stylePreference: { type: String, enum: ['CINEMATIC', 'VLOG', 'UGC', 'CORPORATE'], default: 'CINEMATIC' },
    trainingDataUrls: [{ type: String }],
    lastTrainingDate: { type: Date }
  },
  masterBrainConfig: {
    intelligenceLevel: { type: Number, default: 100 }, // 100 = Pro Advance
    viralOptimization: { type: Boolean, default: true },
    nicheFocus: { type: String },
    languageStyle: { type: String, default: 'HINGLISH' },
    hookSensitivity: { type: Number, default: 0.95 } // High sensitivity for viral hooks
  },
  usageStats: {
    dailyAiMinutes: { type: Number, default: 0 },
    videosCreatedToday: { type: Number, default: 0 },
    reelsCreatedToday: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now },
    workersLastRun: { type: Map, of: Date } // Cross-device AI worker cooldowns
  },
  billing: {
    isTrialActive: { type: Boolean, default: true },
    trialStartDate: { type: Date, default: Date.now },
    autopayActive: { type: Boolean, default: false },
    autopayValidatedAt: { type: Date },
    autopayPrice: { type: Number, default: 1499 }, // ₹1499 for India
    paymentSourceId: { type: String, unique: true, sparse: true }, // Unique Bank/Autopay link ID
    failedAutopayAttempts: { type: Number, default: 0 },
    lastAutopayPauseDate: { type: Date }
  },
  isSetupComplete: { type: Boolean, default: false },
  socialLinks: [{
    platform: { type: String },
    url: { type: String },
    handle: { type: String },
    accessToken: { type: String }, // Encrypted OAuth Token
    refreshToken: { type: String }, // Encrypted OAuth Refresh Token
    credentialsSecure: { type: String }, // Legacy Encrypted
    isConnected: { type: Boolean, default: false }
  }],
  security: {
    lastIp: { type: String },
    deviceFingerprint: { type: String },
    isBlocked: { type: Boolean, default: false },
    blockReason: { type: String },
    isRobotic: { type: Boolean, default: false }
  },
  autoPostEnabled: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Performance Indexes
UserSchema.index({ "security.deviceFingerprint": 1 });
UserSchema.index({ "profile.role": 1 });
UserSchema.index({ "subscription.planId": 1 });

module.exports = mongoose.model('User', UserSchema);
