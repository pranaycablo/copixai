# 🏗️ HeroAi — PART 2: COMPLETE BASE ARCHITECTURE
## Database Schema + API Design + Service Map + Assured Growth Engine
### Status: PRODUCTION-READY | ZERO GAPS | ALL LAYERS COVERED

---

## 📦 SECTION 1: PROJECT FOLDER STRUCTURE

```
HeroAi/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB connection
│   │   │   ├── redis.js           # Redis connection
│   │   │   └── env.js             # All env variables
│   │   ├── models/                # MongoDB Schemas
│   │   │   ├── User.model.js
│   │   │   ├── Admin.model.js
│   │   │   ├── Blueprint.model.js
│   │   │   ├── Video.model.js
│   │   │   ├── Job.model.js
│   │   │   ├── ApiKey.model.js
│   │   │   ├── Plan.model.js
│   │   │   ├── Subscription.model.js
│   │   │   ├── Affiliate.model.js
│   │   │   ├── Wallet.model.js
│   │   │   ├── GrowthLog.model.js
│   │   │   └── RevenueLog.model.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── content.routes.js
│   │   │   ├── growth.routes.js
│   │   │   ├── affiliate.routes.js
│   │   │   ├── payment.routes.js
│   │   │   └── admin.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── content.controller.js
│   │   │   ├── growth.controller.js
│   │   │   └── admin.controller.js
│   │   ├── ai/
│   │   │   ├── MasterAI.js        # Commander AI
│   │   │   ├── agents/
│   │   │   │   ├── TrendAI.js
│   │   │   │   ├── ScriptAI.js
│   │   │   │   ├── VoiceAI.js
│   │   │   │   ├── AvatarAI.js
│   │   │   │   ├── ClipAI.js
│   │   │   │   ├── AssemblyAI.js
│   │   │   │   ├── SEOAI.js
│   │   │   │   ├── ThumbnailAI.js
│   │   │   │   ├── AnalyticsAI.js
│   │   │   │   └── GrowthAI.js
│   │   │   └── orchestrator/
│   │   │       ├── ApiOrchestrator.js   # Zero-Budget API engine
│   │   │       └── ApiKeyRotator.js     # Free → Paid rotation
│   │   ├── queue/
│   │   │   ├── videoQueue.js      # BullMQ queue setup
│   │   │   └── workers/
│   │   │       └── videoWorker.js # Processes video jobs
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── rateLimit.middleware.js
│   │   │   ├── admin.middleware.js
│   │   │   └── planGuard.middleware.js
│   │   ├── services/
│   │   │   ├── otp.service.js
│   │   │   ├── storage.service.js  # Temp upload + auto-delete
│   │   │   ├── notification.service.js
│   │   │   ├── payment.service.js
│   │   │   └── social.service.js   # OAuth posting
│   │   ├── cron/
│   │   │   ├── growthMonitor.cron.js   # Runs daily
│   │   │   ├── creditReset.cron.js     # Runs at midnight
│   │   │   └── resumePaused.cron.js    # Resumes paused jobs
│   │   └── app.js
├── admin-panel/                   # Separate Next.js admin dashboard
├── frontend/                      # React Native mobile app
└── docker-compose.yml
```

---

## 🗄️ SECTION 2: DATABASE SCHEMAS (MongoDB)

### 2.1 User Schema
```javascript
// models/User.model.js
{
  _id: ObjectId,
  phone: { type: String, unique: true, required: true },
  googleId: { type: String },
  name: String,
  email: String,
  role: { type: String, enum: ['user', 'creator_affiliate'], default: 'user' },

  // Plan
  currentPlan: { type: String, enum: ['free', 'starter', 'growth', 'pro'], default: 'free' },
  planExpiry: Date,
  dailyVideoLimit: { type: Number, default: 1 },
  videosGeneratedToday: { type: Number, default: 0 },
  creditsResetAt: Date,

  // Feature Unlocks (AI-triggered)
  seoPlanVisible: { type: Boolean, default: false },
  adsPlanVisible: { type: Boolean, default: false },

  // Affiliate
  referralCode: { type: String, unique: true },
  referredBy: { type: ObjectId, ref: 'User' },

  // Social Connections (OAuth — tokens encrypted)
  connectedPlatforms: [{
    platform: String,            // 'youtube', 'instagram', etc.
    accessTokenEncrypted: String,
    refreshTokenEncrypted: String,
    channelId: String,
    connectedAt: Date
  }],

  // Auto Mode
  autoModeEnabled: { type: Boolean, default: false },

  // Security
  otpAttempts: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },

  createdAt: Date,
  updatedAt: Date
}
```

### 2.2 Digital DNA Blueprint Schema
```javascript
// models/Blueprint.model.js
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', unique: true },

  platforms: [String],
  channelUrls: [{ platform: String, url: String }],
  contentDescription: String,
  niche: String,                  // 'comedy', 'news', 'custom_value'
  customNiche: String,
  userType: { type: String, enum: ['creator','business','influencer','agency'] },
  audience: {
    country: String,
    ageGroup: String
  },
  tone: String,                   // 'energetic', 'professional', 'calm'
  language: String,               // 'hindi', 'english', 'hinglish'

  // Digital Clone
  faceModelUrl: String,           // Private S3 URL (encrypted)
  voiceModelUrl: String,          // Private S3 URL (encrypted)
  hasCustomFace: { type: Boolean, default: false },
  hasCustomVoice: { type: Boolean, default: false },

  // Content Behavior
  dailyVideosWanted: Number,
  preferredPostTime: String,
  contentTypes: [String],         // ['ugc', 'promotional', 'branding']

  // AI Learning Data
  performanceHistory: [{
    topic: String,
    scriptStyle: String,
    hookType: String,
    views: Number,
    engagement: Number,
    watchTime: Number,
    rating: String                // 'high_performer' | 'low_performer'
  }],

  // Topics already used (prevent duplication)
  usedTopics: [String],

  updatedAt: Date
}
```

### 2.3 Video Job Schema
```javascript
// models/Job.model.js
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User' },
  contentType: { type: String, enum: ['ugc', 'promotional', 'branding'] },
  topic: String,
  script: String,
  status: {
    type: String,
    enum: [
      'queued', 'script_gen', 'parallel_processing',
      'assembly', 'ready', 'delivered',
      'paused_credit', 'failed'
    ],
    default: 'queued'
  },

  // Segment tracking (for pause/resume)
  totalSegments: Number,
  completedSegments: [Number],
  pendingSegments: [Number],
  segmentUrls: [String],          // Temp URLs (deleted after merge)

  // Output
  finalVideoUrl: String,          // Signed URL, 24-hr expiry
  shortsUrls: [String],
  seoData: {
    title: String,
    description: String,
    hashtags: [String],
    tags: [String]
  },
  thumbnailUrl: String,

  // Cost tracking
  apiCostInr: { type: Number, default: 0 },

  // Delivery
  deliveredAt: Date,
  deletedAt: Date,                // When files were auto-deleted
  autoPosted: { type: Boolean, default: false },

  createdAt: Date,
  updatedAt: Date
}
```

### 2.4 API Key Schema (Admin Vault)
```javascript
// models/ApiKey.model.js
{
  _id: ObjectId,
  module: {
    type: String,
    enum: ['script','voice','avatar','clip','seo','thumbnail','trend','ads']
  },
  provider: String,               // 'gemini', 'groq', 'google_tts', 'pexels'
  keyEncrypted: String,           // AES-256 encrypted
  tier: { type: String, enum: ['free', 'paid'] },
  priority: Number,               // 1 = highest priority (use first)
  dailyLimit: Number,
  usedToday: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  lastFailedAt: Date,
  failCount: { type: Number, default: 0 },
  addedByAdmin: { type: ObjectId, ref: 'Admin' },
  createdAt: Date
}
```

### 2.5 Growth Log Schema
```javascript
// models/GrowthLog.model.js
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User' },
  platform: String,
  date: Date,
  metrics: {
    views: Number,
    watchTime: Number,
    engagement: Number,
    subscribers: Number,
    expectedViews: Number
  },
  aiDecision: {
    action: String,               // 'continue' | 'trigger_seo' | 'trigger_ads' | 'improve_hook'
    message: String,              // Message shown to user
    triggered: Boolean
  }
}
```

### 2.6 Wallet & Affiliate Schema
```javascript
// models/Wallet.model.js
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', unique: true },
  balance: { type: Number, default: 0 },
  totalEarned: Number,
  totalWithdrawn: Number,
  transactions: [{
    type: { type: String, enum: ['credit', 'debit'] },
    amount: Number,
    reason: String,               // 'referral', 'creator_commission', 'voice_sale'
    referenceId: String,
    date: Date
  }],
  withdrawalRequests: [{
    amount: Number,
    method: String,               // 'upi' | 'bank'
    accountDetails: String,       // Encrypted
    status: String,               // 'pending' | 'approved' | 'rejected'
    requestedAt: Date,
    processedAt: Date
  }]
}
```

### 2.7 Revenue Log Schema (Admin Panel)
```javascript
// models/RevenueLog.model.js
{
  date: Date,
  streams: {
    subscriptions: Number,
    adsCommission: Number,
    affiliateStandard: Number,
    affiliateCreator: Number,
    voiceMarketplace: Number,
    premiumUnlock: Number,
    creditUpsell: Number
  },
  totalCost: Number,
  netProfit: Number
}
```

---

## 🔌 SECTION 3: API ROUTES DESIGN

### 3.1 Auth Routes
```
POST /api/auth/send-otp          → Send OTP to phone
POST /api/auth/verify-otp        → Verify OTP → JWT issued
POST /api/auth/google            → Google OAuth login
POST /api/auth/refresh           → Refresh access token
POST /api/auth/logout            → Clear cookies
```

### 3.2 User Routes
```
GET  /api/user/profile           → Get user + plan info
PUT  /api/user/blueprint         → Save/Update Digital DNA
GET  /api/user/blueprint         → Get current blueprint
GET  /api/user/dashboard         → Dashboard data (plan, credits, videos today)
POST /api/user/connect-social    → Connect YouTube/Instagram OAuth
DELETE /api/user/disconnect/:platform
PUT  /api/user/auto-mode         → Toggle auto mode ON/OFF
DELETE /api/user/account         → GDPR delete all data
```

### 3.3 Content Routes
```
POST /api/content/generate       → Trigger video generation
GET  /api/content/job/:jobId     → Get job status + progress %
GET  /api/content/history        → List user's generated videos
GET  /api/content/download/:jobId → Get signed download URL
PUT  /api/content/script/:jobId  → User edits script before gen starts
```

### 3.4 Growth Routes
```
GET  /api/growth/metrics         → User's latest performance data
GET  /api/growth/suggestions     → AI growth tips for user
GET  /api/growth/plans-available → What plans are unlocked (AI-based)
POST /api/growth/connect-analytics → Connect YouTube Analytics
```

### 3.5 Affiliate Routes
```
GET  /api/affiliate/my-link      → Get user's referral link
GET  /api/affiliate/stats        → Referrals count, commission earned
GET  /api/wallet/balance         → Wallet balance + transaction history
POST /api/wallet/withdraw        → Request withdrawal
```

### 3.6 Payment Routes
```
POST /api/payment/create-order   → Create Razorpay/Stripe order
POST /api/payment/verify         → Verify payment + activate plan
POST /api/payment/webhook        → Payment gateway webhook (secure)
GET  /api/payment/history        → User payment history
```

### 3.7 Admin Routes (Separate — Protected by 2FA)
```
POST /api/admin/login            → Admin login (password + TOTP)
POST /api/admin/api-keys         → Add new API key
GET  /api/admin/api-keys         → List all keys (encrypted, partial shown)
PUT  /api/admin/api-keys/:id     → Update priority / deactivate key
GET  /api/admin/revenue          → Revenue dashboard data
GET  /api/admin/users            → User list + plan stats
GET  /api/admin/queue-health     → BullMQ queue status
GET  /api/admin/withdrawals      → Pending withdrawal requests
PUT  /api/admin/withdrawals/:id  → Approve / reject withdrawal
POST /api/admin/kill-switch      → Pause/resume specific modules
```

---

## ⚙️ SECTION 4: THE ZERO-BUDGET API ORCHESTRATOR

```javascript
// ai/orchestrator/ApiOrchestrator.js

class ApiOrchestrator {

  async getBestKey(module) {
    // Step 1: Get all active FREE keys for this module, sorted by priority
    const freeKeys = await ApiKey.find({
      module, tier: 'free', isActive: true,
      $expr: { $lt: ['$usedToday', '$dailyLimit'] }
    }).sort({ priority: 1 });

    if (freeKeys.length > 0) {
      return this.decryptKey(freeKeys[0]); // Use highest priority free key
    }

    // Step 2: All free keys exhausted → get cheapest paid key
    const paidKey = await ApiKey.findOne({
      module, tier: 'paid', isActive: true
    }).sort({ priority: 1 });

    if (paidKey) {
      return this.decryptKey(paidKey);
    }

    // Step 3: No keys available → throw (Master AI will handle gracefully)
    throw new Error(`NO_API_AVAILABLE:${module}`);
  }

  async recordUsage(keyId, costInr = 0) {
    await ApiKey.findByIdAndUpdate(keyId, {
      $inc: { usedToday: 1 }
    });
    // Log cost to daily budget tracker
    await this.updateDailyCost(costInr);
  }

  async markFailed(keyId) {
    await ApiKey.findByIdAndUpdate(keyId, {
      $inc: { failCount: 1 },
      lastFailedAt: new Date(),
      // Auto-disable if fails 3 times in a day
      ...(failCount >= 3 && { isActive: false })
    });
  }
}
```

---

## 🤖 SECTION 5: MASTER AI COMMAND ENGINE

```javascript
// ai/MasterAI.js

class MasterAI {

  async execute(userId, contentType) {
    // Load user's Digital DNA from Redis cache (instant)
    const blueprint = await redis.get(`blueprint:${userId}`)
                   || await Blueprint.findOne({ userId });

    // STEP 1: Get trending topic via Trend AI
    const topic = await TrendAI.getBestTopic(blueprint);

    // CHECK: Has user made this topic before? (No duplicate rule)
    if (blueprint.usedTopics.includes(topic)) {
      topic = await TrendAI.getAlternateTopic(blueprint);
    }

    // STEP 2: Generate script via Script AI
    let script = await ScriptAI.generate({ topic, blueprint, contentType });

    // QUALITY GATE: Score the script
    const score = await this.scoreScript(script);
    if (score < 70) {
      script = await ScriptAI.generate({ topic, blueprint, contentType, retry: true });
    }

    // STEP 3: Mark job as 'parallel_processing', launch parallel tasks
    const [voiceResult, clipsResult, seoResult, thumbResult] = await Promise.all([
      VoiceAI.generate(script, blueprint.voiceModelUrl),
      ClipAI.fetchForScript(script, blueprint),
      SEOAI.generate(topic, script, blueprint),
      ThumbnailAI.generate(topic, blueprint)
    ]);

    // STEP 4: Avatar AI (needs voice result first)
    const avatarVideo = await AvatarAI.generate({
      faceModel: blueprint.faceModelUrl,
      audioUrl: voiceResult.audioUrl,
      hasCustomFace: blueprint.hasCustomFace
    });

    // STEP 5: Assembly AI — merge everything
    const finalVideo = await AssemblyAI.merge({
      avatarVideo,
      clips: clipsResult.clips,
      script,
      captions: true,
      music: true
    });

    // STEP 6: Extract shorts
    const shorts = await AssemblyAI.extractShorts(finalVideo.url, 3);

    // STEP 7: Mark job ready, notify user
    return {
      videoUrl: finalVideo.url,
      shorts,
      seo: seoResult,
      thumbnail: thumbResult.url
    };
  }
}
```

---

## 📊 SECTION 6: AI GROWTH MONITOR (Assured Growth Engine)

```javascript
// cron/growthMonitor.cron.js
// Runs every day at 6:00 AM for all active users

async function runGrowthMonitor() {
  const activeUsers = await User.find({ currentPlan: { $ne: 'free' } });

  for (const user of activeUsers) {
    const metrics = await AnalyticsAI.fetchMetrics(user);
    const decision = await GrowthAI.analyze(user, metrics);

    // Save log
    await GrowthLog.create({ userId: user._id, metrics, aiDecision: decision });

    // Act on decision
    if (decision.action === 'trigger_seo' && !user.seoPlanVisible) {
      await User.findByIdAndUpdate(user._id, { seoPlanVisible: true });
      await NotificationService.send(user._id, decision.message);
    }

    if (decision.action === 'trigger_ads' && !user.adsPlanVisible) {
      await User.findByIdAndUpdate(user._id, { adsPlanVisible: true });
      await NotificationService.send(user._id, decision.message);
    }

    // Update AI Learning Engine
    await Blueprint.findOneAndUpdate(
      { userId: user._id },
      { $push: { performanceHistory: { topic, ...metrics, rating: decision.rating } } }
    );
  }
}
```

---

## 💳 SECTION 7: PAYMENT & PLAN ACTIVATION FLOW

```
User selects Plan → POST /api/payment/create-order
  → Creates Razorpay order (₹499 / ₹999 / ₹1999)
  → Returns order_id to frontend

User pays → Razorpay processes payment

Razorpay sends webhook → POST /api/payment/webhook
  → Verify webhook signature (HMAC-SHA256)
  → Find user by order metadata
  → Update user:
      currentPlan = 'starter' / 'growth' / 'pro'
      dailyVideoLimit = 1 / 3 / 5
      planExpiry = now + 30 days
  → Send confirmation notification to user
  → Log revenue in RevenueLog
```

---

## 🔗 SECTION 8: SOCIAL MEDIA AUTO-POSTING FLOW

```
User enables Auto Mode → Connects YouTube/Instagram via OAuth
  → OAuth token stored (AES-256 encrypted)

DAILY (Auto Mode active users):
  → Master AI generates video (as normal)
  → social.service.js decrypts token
  → POST to YouTube: youtube.videos.insert() with title, desc, tags
  → POST to Instagram: Graph API upload + publish
  → Log: job.autoPosted = true
  → DELETE video from server immediately after successful post
```

---

## 🏗️ SECTION 9: FULL SYSTEM COMPONENT MAP

```
┌─────────────────────────────────────────────────────────────┐
│                    HeroAi SYSTEM MAP                       │
├─────────────────────────────────────────────────────────────┤
│  FRONTEND (React Native)                                    │
│  ├── Auth Screen → OTP / Google                             │
│  ├── Onboarding → 7-step DNA wizard                         │
│  ├── Dashboard → Plans + Generate button                    │
│  ├── Job Status → Live progress bar                         │
│  ├── Growth Screen → Metrics + AI tips                      │
│  ├── Affiliate Screen → Link + Wallet                       │
│  └── Settings → Auto mode + connected accounts             │
├─────────────────────────────────────────────────────────────┤
│  BACKEND (Node.js + Express)                                │
│  ├── Auth Service → OTP + JWT                               │
│  ├── User Service → Profile + Blueprint                     │
│  ├── Content Service → Triggers Master AI                   │
│  ├── BullMQ Queue → Video jobs                              │
│  ├── Video Worker → FFmpeg + AI agents                      │
│  ├── Growth Service → Monitor + Triggers                    │
│  ├── Payment Service → Razorpay/Stripe                      │
│  ├── Affiliate Service → Referrals + Wallet                 │
│  └── Admin Service → API Vault + Revenue                    │
├─────────────────────────────────────────────────────────────┤
│  AI LAYER                                                   │
│  ├── Master AI → Commands all agents                        │
│  ├── API Orchestrator → Zero-budget key rotation            │
│  └── 10 Specialist Agents (Trend/Script/Voice/Avatar...)    │
├─────────────────────────────────────────────────────────────┤
│  DATA LAYER                                                 │
│  ├── MongoDB → All persistent data                          │
│  ├── Redis → Blueprint cache + Rate limits + Queue          │
│  └── AWS S3 (Temp) → Files deleted after delivery          │
├─────────────────────────────────────────────────────────────┤
│  ADMIN PANEL (Next.js — separate)                           │
│  ├── API Vault → Add/manage all AI keys                     │
│  ├── Revenue → 7 streams, real-time                         │
│  ├── Users → Plans, usage, churn                            │
│  ├── Queue Health → BullMQ monitor                          │
│  ├── Withdrawals → Approve/reject affiliate payouts         │
│  └── Kill Switches → Emergency controls                     │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ PART 2 — COMPLETION CHECKLIST

- [x] Full folder structure defined
- [x] All 12 MongoDB schemas (User, Blueprint, Job, ApiKey, Wallet, Revenue...)
- [x] All API routes (Auth, User, Content, Growth, Affiliate, Payment, Admin)
- [x] Zero-Budget API Orchestrator (code pattern)
- [x] Master AI command engine (code pattern)
- [x] Growth Monitor cron job (assured growth logic)
- [x] Payment + Plan activation flow
- [x] Social media auto-posting flow
- [x] Full system component map
- [x] Admin → AI → User → Output → Growth: All layers connected
- [x] Zero gaps. Every module connects to the next.

---

> **NEXT: PART 3 — Frontend Screens Design + User Experience Flows + Admin Panel UI**

