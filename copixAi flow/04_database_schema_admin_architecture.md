# CopixAI: Master Database Schema & Global Admin Architecture (Part 3)

This document defines the MongoDB Database Schema and the highly dynamic, self-healing Admin Architecture for CopixAI. The goal is a system that can be managed by a **single person**, scales globally, and uses AI to auto-manage APIs, currencies, and technical updates.

---

## 1. Global Scaling & Localization Engine
To expand globally without manual intervention, the system uses an **Auto-Geo-Detector**.

*   **Location Detection:** On signup/visit, the system detects the user's IP/Location.
*   **Dynamic Currency:**
    *   If `Country == 'India'`: Currency = `INR (₹)`, Plans = `₹499 / ₹999`.
    *   If `Country == 'US/Europe/Other'`: Currency = `USD ($)`, Plans = `$15 / $29`.
*   **Dynamic Language:** Website text auto-translates based on browser locale (English, Hindi, Spanish, etc.).

---

## 2. Dynamic Payment Gateway Router
The system does not rely on one payment provider. The Admin Panel holds keys for all gateways, and the system routes the payment based on the user's location.

*   **India Routing:** Razorpay, Cashfree, or PhonePe (Admin selects active).
*   **Global Routing:** Stripe or PayPal.
*   **Admin UI Implementation:** The admin panel has strict, labeled fields for every provider:
    *   `[India] Razorpay Key_ID / Key_Secret`
    *   `[India] PhonePe Merchant_ID / Salt_Key`
    *   `[Global] Stripe Publishable_Key / Secret_Key`

---

## 3. The "Self-Healing" AI Vault (API Auto-Rotation)
The admin can dump hundreds of Free API keys, Gmail accounts (for browser automation), and proxies into the Admin Panel. The backend AI acts as the system manager.

*   **Auto-Filter & Rotate:** If an API key hits its limit (e.g., Error 429) or a Gmail account gets blocked, the AI *instantly* flags it as `dead` or `cooling_down` and switches to the next available key without interrupting the user's video generation.
*   **Speed Optimization:** If an API responds too slowly, the AI clears the temporary cache and shifts the load to a faster provider.

---

## 4. CTO Mode: AI Self-Coding Integration
Since the system is managed by one person, CopixAI has a "CTO Command Prompt" in the Admin Panel.
*   If a new AI model (e.g., ChatGPT-5 or Claude 3.5) releases, the Admin writes: *"Add support for Claude 3.5 API."*
*   The Master Backend AI writes the integration code, tests it in a sandbox, and implements it into the live `AiVault` router automatically. 

---

## 5. MongoDB Master Schema Definitions

### 5.1 `AdminConfig` (The Master Controller)
```json
{
  "_id": "master_config",
  "paymentGateways": {
    "india": {
      "razorpay": {"keyId": "rzp_...", "keySecret": "...", "isActive": true},
      "phonepe": {"merchantId": "...", "saltKey": "...", "isActive": false}
    },
    "global": {
      "stripe": {"publicKey": "pk_...", "secretKey": "sk_...", "isActive": true},
      "paypal": {"clientId": "...", "clientSecret": "...", "isActive": false}
    }
  },
  "geoPricing": {
    "IN": {"starter": 499, "growth": 999, "agency": 9999, "currency": "INR"},
    "US": {"starter": 15, "growth": 29, "agency": 299, "currency": "USD"},
    "GLOBAL": {"starter": 19, "growth": 39, "agency": 349, "currency": "USD"}
  }
}
```

### 5.2 `AiVault` (The Auto-Rotating Engine Pool)
```json
{
  "_id": "ObjectId",
  "type": "Enum('API_KEY', 'BROWSER_GMAIL', 'PROXY')",
  "provider": "String", // e.g., 'Groq', 'Gemini', 'GoogleAccount'
  "credentials": {
    "apiKey": "String",
    "email": "String",
    "passwordEncrypted": "String"
  },
  "status": "Enum('ACTIVE', 'EXHAUSTED', 'COOLING_DOWN', 'BANNED')",
  "dailyUsageCount": "Number",
  "averageResponseTimeMs": "Number", // If > 5000ms, AI rotates it
  "lastUsedAt": "Date",
  "resetAt": "Date" // Time when free tier resets
}
```

### 5.3 `Users` (Creator Profiles)
```json
{
  "_id": "ObjectId",
  "auth": {
    "email": "String",
    "googleId": "String",
    "phone": "String"
  },
  "profile": {
    "name": "String",
    "countryCode": "String", // Auto-detected (e.g., 'IN', 'US')
    "currency": "String"
  },
  "wallet": {
    "balance": "Number", // Affiliate earnings
    "totalEarned": "Number"
  },
  "subscription": {
    "planId": "String", // 'starter', 'growth', 'agency'
    "status": "Enum('ACTIVE', 'EXPIRED', 'TRIAL')",
    "creditsRemaining": "Number",
    "expiresAt": "Date"
  },
  "digitalIdentity": {
    "voiceCloneId": "String", // Reference to saved TTS model
    "faceAvatarId": "String", // Reference to saved visual avatar
    "niche": "String"
  },
  "socialConnections": {
    "youtube": {"accessToken": "Encrypted", "refreshToken": "Encrypted"},
    "instagram": {"accessToken": "Encrypted", "refreshToken": "Encrypted"}
  }
}
```

### 5.4 `VideoPipelines` (The Segmented Rendering Tracker)
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "socialPlatform": "String",
  "status": "Enum('SCRIPTING', 'GATHERING_ASSETS', 'RENDERING', 'READY', 'POSTED', 'PAUSED_NO_CREDITS')",
  "script": "String",
  "totalSegments": 8, // Split into 10-second chunks
  "completedSegments": 3, // Progress tracker
  "segmentsData": [
    {
      "segmentIndex": 1,
      "text": "String",
      "audioUrl": "String",
      "videoUrl": "String"
    }
  ],
  "scheduledPostTime": "Date", // AI calculated best time
  "finalOutputUrl": "String" // Blank until FFmpeg finishes
}
```

---

## 6. System Workload Distribution (How it runs perfectly)

1. **User Request -> `Users` & `VideoPipelines`:** User requests a video. Database creates a pipeline document.
2. **AI Allocation -> `AiVault`:** The backend requests an API key/Browser account. The system queries `AiVault` for `status: ACTIVE` sorted by lowest `averageResponseTimeMs`.
3. **Failure Handling:** If the API fails, `AiVault` updates status to `COOLING_DOWN`, logs the error, clears cache, and immediately fetches the next key. The video rendering continues without the user ever knowing there was a failure.
4. **Checkout -> `AdminConfig`:** When a user buys a plan, the backend checks `Users.profile.countryCode`. It pulls the correct pricing from `geoPricing` and opens the correct gateway (Razorpay vs Stripe) from `paymentGateways`.

This architecture guarantees that the single administrator never has to manually change code to swap APIs or update prices—the AI handles the infrastructure health entirely.
