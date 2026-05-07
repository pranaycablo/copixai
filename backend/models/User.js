const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  auth: {
    email: { type: String, unique: true, index: true, sparse: true },
    password: { type: String }, // Used if no OAuth
    googleId: { type: String, index: true, sparse: true },
    phone: { type: String, unique: true, index: true, sparse: true },
    otp: { type: String },
    otpExpires: { type: Date }
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
    referralCode: { type: String, unique: true, sparse: true, default: () => 'HAI-' + Math.random().toString(36).substr(2, 9).toUpperCase() },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    activeReferralsCount: { type: Number, default: 0 }, // Count of users who signed up AND linked social
    claimedRewardsCount: { type: Number, default: 0 }, // How many 5-user rewards already claimed
    hasContributedReferralPoint: { type: Boolean, default: false }, // Tracks if this user gave a point to their referrer
    lastPopupShown: { type: Date }
  },
  subscription: {
    // 3 Main Plan Types
    contentPlan: { 
      tier: { type: String, enum: ['FREE', 'GRO', 'PRO', 'PREMIUM'], default: 'FREE' },
      expiresAt: { type: Date }
    },
    seoPlan: { 
      tier: { type: String, enum: ['NONE', 'GRO', 'PRO', 'PREMIUM'], default: 'NONE' },
      expiresAt: { type: Date }
    },
    adsPlan: { 
      tier: { type: String, enum: ['NONE', 'GRO', 'PRO', 'PREMIUM'], default: 'NONE' },
      expiresAt: { type: Date }
    },
    planId: { type: String, enum: ['beginner', 'pro_creator', 'business', 'agency'], default: 'beginner' },
    creditsRemaining: { type: Number, default: 3 }, // Signup bonus: 3 Tokens
    dailyTokenQuota: { type: Number, default: 1 }, // Set by Admin
    signupBonusUsed: { type: Boolean, default: false }
  },
  adsConfig: {
    targetAge: { min: Number, max: Number },
    targetArea: [String],
    budget: { type: Number },
    objectives: [{ type: String, enum: ['BRANDING', 'MARKETING', 'OFFER', 'UGC', 'AWARENESS'] }],
    platforms: [{ type: String, enum: ['META', 'GOOGLE'] }]
  },
  usageStats: {
    tokensUsedToday: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now },
    connectedChannelsCount: { type: Number, default: 0 } // Max 2 for Free
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
  billing: {
    isTrialActive: { type: Boolean, default: true },
    trialStartDate: { type: Date, default: Date.now },
    autopayActive: { type: Boolean, default: false },
    autopayValidatedAt: { type: Date },
    autopayPrice: { type: Number, default: 1499 }, // ₹1499 for India
    paymentSourceId: { type: String, sparse: true },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    transactionHistory: [{
      amount: Number,
      planId: String,
      status: String,
      date: { type: Date, default: Date.now }
    }],
    failedAutopayAttempts: { type: Number, default: 0 },
    lastAutopayPauseDate: { type: Date }
  },
  // AGENCY CLIENT MANAGEMENT
  clients: [{
    clientName: String,
    niche: String,
    platformLinks: [{
        platform: String,
        handle: String,
        isConnected: { type: Boolean, default: false }
    }],
    adsConfig: {
      platform: { type: String, enum: ['GOOGLE', 'META'], default: 'GOOGLE' },
      objective: String,
      targetAge: { min: Number, max: Number },
      targetArea: String,
      budget: Number
    },
    status: { type: String, default: 'ACTIVE' }
  }],
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

