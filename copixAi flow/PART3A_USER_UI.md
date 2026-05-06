# 🎨 CopixAI — PART 3A: USER APP UI
## All Screens | Complete Flow | React Native

---

## 🎨 DESIGN SYSTEM

| Token | Value | Use |
|-------|-------|-----|
| Primary | #7C3AED (Purple) | Buttons, highlights |
| Secondary | #F59E0B (Amber) | Earnings, alerts |
| Dark BG | #0F0F0F | App background |
| Card BG | #1A1A2E | Cards, panels |
| Success | #10B981 | Growth positive |
| Danger | #EF4444 | Low performance |
| Text Main | #FFFFFF | Headings |
| Text Sub | #9CA3AF | Subtitles |
| Font | Inter / Poppins | All text |

---

## 📱 SCREEN 1: SPLASH / ONBOARDING

```
┌──────────────────────────┐
│     [CopixAI Logo]       │
│    ✨ Purple gradient BG  │
│                          │
│  "Your AI Content Team"  │
│  sub: Grow on autopilot  │
│                          │
│  [GET STARTED]  ──────►  │
│  [LOGIN]                 │
└──────────────────────────┘
```
- 3-slide carousel onboarding (skip allowed)
- Slide 1: "AI makes your videos"
- Slide 2: "Your face. Your voice."
- Slide 3: "Grow every single day."

---

## 📱 SCREEN 2: AUTH (OTP / Google)

```
┌──────────────────────────┐
│  ←  Sign In              │
│                          │
│  📱 Phone Number         │
│  ┌──────────────────┐    │
│  │ +91  9876543210  │    │
│  └──────────────────┘    │
│                          │
│  [SEND OTP] ──────────►  │
│                          │
│  ─────── OR ─────────    │
│                          │
│  [G]  Continue w/ Google │
└──────────────────────────┘
```

**OTP Screen:**
```
┌──────────────────────────┐
│  ← Enter OTP             │
│  Sent to +91-9876XXXXXX  │
│                          │
│  [_] [_] [_] [_] [_] [_]│  ← 6-digit OTP boxes
│                          │
│  Resend in 0:45          │
│                          │
│  [VERIFY & CONTINUE] ──► │
└──────────────────────────┘
```

---

## 📱 SCREEN 3: DIGITAL DNA WIZARD (7 Steps)

**Progress bar: ●●○○○○○ Step 1 of 7**

**Step 1 — Platforms:**
```
┌──────────────────────────┐
│  Which platforms?        │
│                          │
│  ☑ YouTube    □ Insta    │
│  □ LinkedIn   □ Facebook │
│  □ TikTok     □ X        │
│                          │
│         [NEXT →]         │
└──────────────────────────┘
```

**Step 2 — Channel Link:**
```
┌──────────────────────────┐
│  Add your YouTube link   │
│  ┌──────────────────┐    │
│  │ youtube.com/c/.. │    │
│  └──────────────────┘    │
│         [NEXT →]         │
└──────────────────────────┘
```

**Step 3 — Content Description:**
```
┌──────────────────────────┐
│  Tell AI about yourself  │
│  ┌──────────────────┐    │
│  │ I make comedy    │    │
│  │ content for      │    │
│  │ Indian youth...  │    │
│  └──────────────────┘    │
│  This is your AI's DNA   │
│         [NEXT →]         │
└──────────────────────────┘
```

**Step 4 — Audience:**
```
┌──────────────────────────┐
│  Your audience is from?  │
│  ◉ India  ○ USA          │
│  ○ UK     ○ Global       │
│                          │
│  Age Group:              │
│  ○ 13-17  ◉ 18-35        │
│  ○ 35-50  ○ 50+          │
│         [NEXT →]         │
└──────────────────────────┘
```

**Step 5 — User Type:**
```
┌──────────────────────────┐
│  You are a...            │
│                          │
│  🎬 Creator              │
│  💼 Business             │
│  ⭐ Influencer           │
│  🏢 Agency               │
│                          │
│  (Tap to select)         │
└──────────────────────────┘
```

**Step 6 — Category:**
```
┌──────────────────────────┐
│  Your content category   │
│                          │
│  😂 Comedy  📰 News      │
│  💃 Dance   ✈ Travel     │
│  📚 Education            │
│  🏛 Politician           │
│  ✏ Custom: [________]   │
│         [NEXT →]         │
└──────────────────────────┘
```

**Step 7 — Face & Voice:**
```
┌──────────────────────────┐
│  Your Digital Clone      │
│                          │
│  👤 Face Photo           │
│  [Upload Image] or [Skip]│
│                          │
│  🎤 Voice Sample         │
│  [Record 30 sec] or [Skip]│
│                          │
│  ⚡ AI will use your     │
│  real face + voice!      │
│                          │
│  [FINISH SETUP →]        │
└──────────────────────────┘
```

---

## 📱 SCREEN 4: MAIN DASHBOARD

```
┌──────────────────────────┐
│ Hi Rahul 👋   [🔔] [👤]  │
│                          │
│ ┌──────────────────────┐ │
│ │ 📦 CONTENT PLAN      │ │
│ │ FREE TRIAL — Day 2/3 │ │
│ │ 1 video remaining    │ │
│ │ [UPGRADE PLAN]       │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │ 🎬 GENERATE VIDEO    │ │  ← BIG CTA
│ │                      │ │
│ │ Choose type:         │ │
│ │ [UGC] [PROMO][BRAND] │ │
│ │                      │ │
│ │  [⚡ GENERATE NOW]   │ │
│ └──────────────────────┘ │
│                          │
│ 📊 Your Growth           │
│ Views: 1,240 ▲ 12%      │
│ Subs:  89    ▲ 5%       │
│                          │
│ [📹][📈][💰][⚙]  ← Nav  │
└──────────────────────────┘
```

---

## 📱 SCREEN 5: VIDEO GENERATION (Progress)

```
┌──────────────────────────┐
│  ← Generating Video...   │
│                          │
│  ████████░░░░  65%       │
│                          │
│  ✅ Trend detected       │
│  ✅ Script written       │
│  ✅ Voice generated      │
│  🔄 Fetching clips...    │
│  ○  Assembling video     │
│  ○  Creating shorts      │
│                          │
│  Topic: "Top Comedy...   │
│  Est. time: 3 min        │
│                          │
│  While you wait:         │
│  [See your past videos]  │
└──────────────────────────┘
```

---

## 📱 SCREEN 6: VIDEO READY / OUTPUT

```
┌──────────────────────────┐
│  🎉 Your Video is Ready! │
│                          │
│  [▶ Preview Thumbnail]   │
│                          │
│  📹 Full Video (2:15)    │
│  [⬇ Download]            │
│                          │
│  🎞 Shorts (3)           │
│  [⬇ Download All]        │
│                          │
│  📋 SEO Pack             │
│  Title: "Top 5 Comedy.." │
│  [Copy Title]            │
│  [Copy Description]      │
│  [Copy Hashtags]         │
│                          │
│  🖼 Thumbnail            │
│  [⬇ Download]            │
│                          │
│  [📤 POST NOW (Manual)]  │
└──────────────────────────┘
```

---

## 📱 SCREEN 7: GROWTH SCREEN (Analytics)

```
┌──────────────────────────┐
│  📈 Your Growth          │
│                          │
│  [YouTube ▼]  [7 days ▼] │
│                          │
│  ┌──────────────────┐    │
│  │  📊 (line graph) │    │
│  │  Views over time │    │
│  └──────────────────┘    │
│                          │
│  Views:     1,240  ▲12%  │
│  Watch Time: 4.2h  ▲8%   │
│  Engagement: 3.8%  ▼1%   │
│  Subs:       89    ▲5%   │
│                          │
│  🤖 AI Says:             │
│  ┌──────────────────┐    │
│  │ "आपकी engagement │    │
│  │ थोड़ी कम है। अगली │    │
│  │ video का hook    │    │
│  │ मैं improve      │    │
│  │ करूँगा।" ✅     │    │
│  └──────────────────┘    │
│                          │
│  [SEO Plan Unlocked! 🔓] │  ← Only if triggered
└──────────────────────────┘
```

---

## 📱 SCREEN 8: PLANS & UPGRADE

```
┌──────────────────────────┐
│  ← Upgrade Plan          │
│                          │
│  📦 CONTENT PLAN         │
│  ┌──────────────────┐    │
│  │ Free  — 3 day    │ ✅ │
│  │ ₹499  — 1 vid/day│    │
│  │ ₹999  — 3 vid/day│ ⭐ │
│  │ ₹1999 — 5 vid/day│    │
│  └──────────────────┘    │
│                          │
│  [Only if AI triggered:] │
│  📊 SEO PLAN — ₹299/mo   │
│  "3x organic growth"     │
│                          │
│  📢 ADS PLAN — ₹599/mo   │
│  "Fast scaling"          │
│                          │
│  [PAY WITH RAZORPAY]     │
└──────────────────────────┘
```

---

## 📱 SCREEN 9: AFFILIATE / WALLET

```
┌──────────────────────────┐
│  💰 Earn with CopixAI    │
│                          │
│  Your Referral Link:     │
│  copixai.com/r/rahul123  │
│  [📋 Copy] [📤 Share]    │
│                          │
│  ┌──────────────────┐    │
│  │ Wallet Balance   │    │
│  │ ₹ 1,200          │    │
│  │ [Withdraw →]     │    │
│  └──────────────────┘    │
│                          │
│  Stats:                  │
│  Referrals:    12        │
│  Converted:    4         │
│  Earned:       ₹400      │
│                          │
│  Transactions ▼          │
│  ₹100 — Referral (Amit)  │
│  ₹100 — Referral (Priya) │
└──────────────────────────┘
```

---

## 📱 SCREEN 10: SETTINGS / AUTO MODE

```
┌──────────────────────────┐
│  ⚙ Settings              │
│                          │
│  🤖 AUTO MODE            │
│  ┌────────────────────┐  │
│  │ ● OFF    ○ ON      │  │
│  │ AI will post daily │  │
│  │ automatically      │  │
│  └────────────────────┘  │
│                          │
│  Connected Accounts:     │
│  ✅ YouTube (Connected)  │
│  [+ Connect Instagram]   │
│  [+ Connect LinkedIn]    │
│                          │
│  Profile Settings        │
│  Update Face Model       │
│  Update Voice Sample     │
│                          │
│  [🗑 Delete My Account]  │
└──────────────────────────┘
```

---

## 📱 BOTTOM NAVIGATION BAR

```
┌─────┬─────┬─────┬─────┐
│ 🏠  │ 📹  │ 📈  │ 👤  │
│Home │Vids │Grow │Profile│
└─────┴─────┴─────┴─────┘
```

---

## 🗺️ COMPLETE USER SCREEN FLOW

```
Splash → Onboarding (3 slides)
  ↓
Auth → OTP / Google
  ↓
DNA Wizard (7 steps — first time only)
  ↓
Dashboard (Home)
  ├── Generate Video → Progress → Output
  ├── Growth Screen → Analytics + AI tips
  ├── Plans → Upgrade
  ├── Affiliate → Wallet
  └── Settings → Auto Mode + Connect Social
```
