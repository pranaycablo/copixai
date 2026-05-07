# 🖥️ HeroAi — PART 3B: ADMIN PANEL UI
## All Panels | Complete Control Tower | Next.js Web Dashboard

---

## 🎨 ADMIN DESIGN SYSTEM

| Token | Value | Use |
|-------|-------|-----|
| Primary | #7C3AED | Action buttons |
| Danger | #EF4444 | Kill switches, warnings |
| Success | #10B981 | Healthy status |
| Warning | #F59E0B | Alerts, low quota |
| BG | #0F0F1A | Admin dark background |
| Card | #1A1A2E | Panel cards |
| Border | #2D2D44 | Dividers |
| Font | Inter | All admin text |

---

## 🖥️ ADMIN LOGIN PAGE

```
┌─────────────────────────────────────┐
│                                     │
│     🔐 HeroAi Admin Control        │
│                                     │
│  Email:                             │
│  ┌─────────────────────────────┐    │
│  │ admin@HeroAi.com           │    │
│  └─────────────────────────────┘    │
│                                     │
│  Password:                          │
│  ┌─────────────────────────────┐    │
│  │ ••••••••••••                │    │
│  └─────────────────────────────┘    │
│                                     │
│  2FA Code (Google Authenticator):   │
│  ┌─────────────────────────────┐    │
│  │ 6-digit code                │    │
│  └─────────────────────────────┘    │
│                                     │
│  [🔒 SECURE LOGIN]                  │
│                                     │
│  ⚠ Unauthorized access is logged   │
└─────────────────────────────────────┘
```

---

## 🖥️ ADMIN DASHBOARD — MAIN OVERVIEW

```
┌─────────────────────────────────────────────────────┐
│  HeroAi Admin   [🔔 3]   admin@HeroAi.com  [Exit] │
├──────────┬──────────────────────────────────────────┤
│  SIDEBAR │  MAIN CONTENT AREA                       │
│          │                                          │
│ 📊 Overview     ←── selected                        │
│ 🔑 API Vault                                        │
│ 💰 Revenue                                          │
│ 👥 Users                                            │
│ ⚙ Queue Health                                      │
│ 💸 Withdrawals                                      │
│ ⚠ Kill Switches                                     │
│ 📋 Audit Log                                        │
└──────────────────────────────────────────────────────┘
```

### Panel 1: Overview (Landing after login)

```
┌───────────────────────────────────────────────┐
│  📊 System Overview — Today                   │
│                                               │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ Revenue  │ │  Users   │ │  Videos  │       │
│ │ ₹48,200  │ │   3,841  │ │   2,104  │       │
│ │ ▲ 12%   │ │   ▲ 8%  │ │  ▲ 15%  │       │
│ └──────────┘ └──────────┘ └──────────┘       │
│                                               │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ API Cost │ │  Active  │ │  Queue   │       │
│ │   ₹420   │ │  Jobs: 8 │ │ Pending:5│       │
│ │ ✅ Low   │ │          │ │          │       │
│ └──────────┘ └──────────┘ └──────────┘       │
│                                               │
│  📈 Revenue Last 30 Days (Line Graph)         │
│  [████████████████████████████]               │
│                                               │
│  🤖 AI System Status:                         │
│  Script AI:    ✅ Healthy  (Gemini Free)      │
│  Voice AI:     ✅ Healthy  (Google TTS Free)  │
│  Clip AI:      ✅ Healthy  (Pexels API)       │
│  Avatar AI:    ✅ Healthy  (SadTalker)        │
│  Assembly AI:  ✅ Healthy  (FFmpeg)           │
└───────────────────────────────────────────────┘
```

---

### Panel 2: API VAULT (Most Used by Admin)

```
┌───────────────────────────────────────────────┐
│  🔑 API Vault                [+ Add New Key]  │
│                                               │
│  MODULE: Script AI                            │
│  ┌────────────────────────────────────────┐   │
│  │ # │ Provider  │Tier│Priority│ Quota   │▲▼│ │
│  ├───┼───────────┼────┼────────┼─────────┤  │ │
│  │ 1 │ Gemini    │FREE│   1    │980/1000 │🟢│ │
│  │ 2 │ Groq      │FREE│   2    │450/500  │🟢│ │
│  │ 3 │ OpenRouter│PAID│   3    │Fallback │⚡│ │
│  └────────────────────────────────────────┘   │
│  [+ Add Key for Script AI]                    │
│                                               │
│  MODULE: Voice AI                             │
│  ┌────────────────────────────────────────┐   │
│  │ 1 │ Google TTS│FREE│   1    │900K/1M  │🟢│ │
│  │ 2 │ Amazon    │FREE│   2    │4.2M/5M  │🟢│ │
│  │ 3 │ Azure TTS │FREE│   3    │480K/500K│🟡│ │
│  └────────────────────────────────────────┘   │
│                                               │
│  MODULE: Clip AI                              │
│  ┌────────────────────────────────────────┐   │
│  │ 1 │ Pexels    │FREE│   1    │Unlimited│🟢│ │
│  │ 2 │ Pixabay   │FREE│   2    │Unlimited│🟢│ │
│  └────────────────────────────────────────┘   │
│                                               │
│  MODULE: Thumbnail AI                         │
│  ┌────────────────────────────────────────┐   │
│  │ 1 │ Stability │FREE│   1    │850/1000 │🟢│ │
│  └────────────────────────────────────────┘   │
│                                               │
│  [Expand: Avatar AI] [Expand: SEO AI]...      │
└───────────────────────────────────────────────┘
```

**Add New Key Modal:**
```
┌─────────────────────────────┐
│  + Add API Key              │
│                             │
│  Module: [Script AI ▼]      │
│  Provider: [Gemini ▼]       │
│  Tier: [Free ●] [Paid ○]   │
│  Priority: [4]              │
│  Daily Limit: [1000]        │
│                             │
│  API Key:                   │
│  [sk-••••••••••••••••••]    │
│                             │
│  [SAVE ENCRYPTED]           │
└─────────────────────────────┘
```

---

### Panel 3: REVENUE DASHBOARD

```
┌───────────────────────────────────────────────┐
│  💰 Revenue Dashboard                          │
│                                               │
│  Period: [Today ▼] [This Month ▼]             │
│                                               │
│  Total Revenue:  ₹48,200                      │
│  Total Cost:     ₹2,100                       │
│  Net Profit:     ₹46,100  (95.6% margin)      │
│                                               │
│  INCOME STREAMS BREAKDOWN:                    │
│  ┌─────────────────────────────────────────┐  │
│  │ Stream            │ Amount  │  % Share  │  │
│  ├───────────────────┼─────────┼───────────┤  │
│  │ Subscriptions     │ ₹38,400 │   79.6%   │  │
│  │ Ads Commission    │ ₹4,200  │    8.7%   │  │
│  │ Affiliate Std     │ ₹2,100  │    4.4%   │  │
│  │ Affiliate Creator │ ₹1,800  │    3.7%   │  │
│  │ Voice Marketplace │ ₹900    │    1.9%   │  │
│  │ Premium Unlock    │ ₹600    │    1.2%   │  │
│  │ Credit Upsell     │ ₹200    │    0.4%   │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  📈 30-day Revenue Graph (stacked bar)        │
│  [Export CSV] [Export PDF]                    │
└───────────────────────────────────────────────┘
```

---

### Panel 4: USER MANAGEMENT

```
┌───────────────────────────────────────────────┐
│  👥 Users                   [🔍 Search]        │
│                                               │
│  Stats:                                       │
│  Total: 3,841  Active: 2,104  Churned: 312    │
│  Trial→Paid Conversion: 34%                   │
│                                               │
│  Plan Distribution:                           │
│  Free:    1,890  (49%)  ████████░░░░░         │
│  Starter:   741  (19%)  ████░░░░░░░░░         │
│  Growth:    892  (23%)  █████░░░░░░░░         │
│  Pro:       318   (8%)  ██░░░░░░░░░░░         │
│                                               │
│  USER LIST:                                   │
│  ┌─────────────────────────────────────────┐  │
│  │ Name    │ Plan    │ Videos │ Status      │  │
│  ├─────────┼─────────┼────────┼────────────┤  │
│  │ Rahul K │ Growth  │  42    │ ✅ Active   │  │
│  │ Priya M │ Starter │  12    │ ✅ Active   │  │
│  │ Amit S  │ Free    │   1    │ ⏳ Trial    │  │
│  │ Sara K  │ Pro     │  89    │ ✅ Active   │  │
│  └─────────────────────────────────────────┘  │
│  [Load More]                                  │
│                                               │
│  User Detail (on click):                      │
│  • Full profile + Blueprint                   │
│  • Video history                              │
│  • Payment history                            │
│  • [Block User] [Reset Password]              │
└───────────────────────────────────────────────┘
```

---

### Panel 5: QUEUE HEALTH

```
┌───────────────────────────────────────────────┐
│  ⚙ Queue Health (BullMQ)    [🔄 Refresh]      │
│                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Pending  │ │ Active   │ │  Done    │      │
│  │    5     │ │    8     │ │  2,104   │      │
│  └──────────┘ └──────────┘ └──────────┘      │
│                                               │
│  ┌──────────┐ ┌──────────┐                   │
│  │  Failed  │ │  Paused  │                   │
│  │    2     │ │    14    │                   │
│  │[Retry All│ │(credit)  │                   │
│  └──────────┘ └──────────┘                   │
│                                               │
│  FAILED JOBS:                                 │
│  ┌─────────────────────────────────────────┐  │
│  │ Job ID    │ User      │ Reason          │  │
│  ├───────────┼───────────┼─────────────────┤  │
│  │ job_4821  │ user_3821 │ Avatar AI fail  │  │
│  │ job_4390  │ user_2901 │ TTS quota hit   │  │
│  └─────────────────────────────────────────┘  │
│  [Retry Selected] [Retry All] [Delete]        │
│                                               │
│  Worker Status:                               │
│  Worker 1: 🟢 Processing job_4901            │
│  Worker 2: 🟢 Processing job_4902            │
│  Worker 3: 🟡 Idle                            │
└───────────────────────────────────────────────┘
```

---

### Panel 6: WITHDRAWAL APPROVALS

```
┌───────────────────────────────────────────────┐
│  💸 Withdrawal Requests     Pending: 3        │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │ User    │Amount │ Method │ Requested    │  │
│  ├─────────┼───────┼────────┼─────────────┤  │
│  │ Rahul K │ ₹500  │ UPI    │ 2h ago      │  │
│  │         │       │        │ [✅ Approve] │  │
│  │         │       │        │ [❌ Reject]  │  │
│  ├─────────┼───────┼────────┼─────────────┤  │
│  │ Priya M │ ₹1200 │ Bank   │ 5h ago      │  │
│  │         │       │        │ [✅ Approve] │  │
│  │         │       │        │ [❌ Reject]  │  │
│  └─────────────────────────────────────────┘  │
│                                               │
│  Completed Withdrawals: [View History]        │
└───────────────────────────────────────────────┘
```

---

### Panel 7: KILL SWITCHES (Emergency)

```
┌───────────────────────────────────────────────┐
│  ⚠️ Emergency Kill Switches                    │
│  ⚠ Changes take effect immediately            │
│                                               │
│  ┌────────────────────────────────────────┐   │
│  │ 🔴 Pause ALL Video Generation     [●] │   │
│  │ Stops all new jobs from being queued   │   │
│  └────────────────────────────────────────┘   │
│                                               │
│  ┌────────────────────────────────────────┐   │
│  │ 🟡 Pause Specific Module:             │   │
│  │ [Script AI ▼]               [PAUSE]   │   │
│  └────────────────────────────────────────┘   │
│                                               │
│  ┌────────────────────────────────────────┐   │
│  │ 💲 Daily API Cost Cap: ₹ [500]        │   │
│  │ Current: ₹420 / ₹500       [UPDATE]   │   │
│  └────────────────────────────────────────┘   │
│                                               │
│  ┌────────────────────────────────────────┐   │
│  │ 🚫 Block User:                        │   │
│  │ User ID / Phone: [___________] [BLOCK]│   │
│  └────────────────────────────────────────┘   │
│                                               │
│  ┌────────────────────────────────────────┐   │
│  │ ❄ Freeze Withdrawal Processing   [●] │   │
│  └────────────────────────────────────────┘   │
└───────────────────────────────────────────────┘
```

---

### Panel 8: AUDIT LOG

```
┌───────────────────────────────────────────────┐
│  📋 Admin Audit Log         [🔍 Filter]        │
│                                               │
│  Every admin action is permanently logged.    │
│  Cannot be deleted.                           │
│                                               │
│  ┌─────────────────────────────────────────┐  │
│  │ Time     │ Action            │ Details  │  │
│  ├──────────┼───────────────────┼──────────┤  │
│  │ 10:42 AM │ API Key Added     │ Gemini   │  │
│  │ 10:15 AM │ Withdrawal Apprvd │ Rahul ₹5 │  │
│  │ 09:50 AM │ Kill Switch ON    │ Paused   │  │
│  │ 09:30 AM │ Kill Switch OFF   │ Resumed  │  │
│  │ Yesterday│ User Blocked      │ user_319 │  │
│  └─────────────────────────────────────────┘  │
└───────────────────────────────────────────────┘
```

---

## 🗺️ COMPLETE ADMIN NAVIGATION

```
Admin Login (Password + 2FA)
  ↓
Overview (System health + Revenue snapshot)
  ├── API Vault → Add/manage all AI API keys
  ├── Revenue → 7 income streams + graphs
  ├── Users → List, details, block
  ├── Queue Health → Jobs, workers, retry failed
  ├── Withdrawals → Approve / Reject
  ├── Kill Switches → Emergency controls
  └── Audit Log → Immutable action history
```

---

## ✅ PART 3 COMPLETION CHECKLIST

**User App Screens:**
- [x] Splash + 3-slide Onboarding
- [x] OTP Auth + Google OAuth
- [x] 7-step DNA Wizard (all steps)
- [x] Dashboard with content type selector
- [x] Video generation progress screen
- [x] Output screen (video + shorts + SEO pack + thumbnail)
- [x] Growth analytics screen with AI messages
- [x] Plans & upgrade screen (hidden plans logic)
- [x] Affiliate & Wallet screen
- [x] Settings + Auto Mode + Social Connect

**Admin Panel:**
- [x] Secure Login (Password + 2FA)
- [x] Overview dashboard (KPIs + AI health)
- [x] API Vault (all modules + add/manage keys)
- [x] Revenue (7 streams breakdown + graphs)
- [x] User management (plans, block, details)
- [x] Queue health (BullMQ jobs + workers)
- [x] Withdrawal approvals
- [x] Kill switches (emergency controls)
- [x] Audit log (immutable)

---

> **NEXT: PART 4 — AI Agent Code Blueprints + API Integration Details**

