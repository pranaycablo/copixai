# CopixAI: Zero-Cost Automation & Multi-Brain Engine Architecture

This document defines the highly optimized, ultra-low-cost (₹1–₹5 per video) backend orchestration system for CopixAI. The system acts as an autonomous "Human Manager," utilizing a mix of Free APIs, Headless Browser Automation, and segmented FFmpeg processing to achieve massive scale with near-zero API costs.

---

## 1. Core Philosophy: The Human Manager AI
CopixAI does not just "generate videos." It manages the creator's digital life.
*   **Study:** Analyzes user audience, geography, niche, and competitor trends.
*   **Strategize:** Determines the exact best time to post and the ideal content format.
*   **Produce:** Uses a multi-brain approach (switching between APIs and Browser Automation) to gather assets for free.
*   **Deliver/Publish:** Auto-posts to connected social accounts or delivers to the user at the exact right moment.

---

## 2. User Onboarding & AI Study Engine

### 2.1 The Setup Flow
1.  **Signup:** OTP / Google OAuth.
2.  **Onboarding Data Collection:**
    *   Platform selection (YouTube, IG, Facebook).
    *   Channel/Page links (for AI analysis).
    *   Category/Niche (e.g., Finance, Motivation).
    *   Target Audience Country.
    *   Desired Frequency (e.g., 1 Long, 3 Shorts per day).

### 2.2 The Study Engine (Intelligence Layer)
Immediately after onboarding, the **Growth/Analytics Engine** activates:
1.  **Data Scraping:** Scrapes the user's provided channel links and competitor channels to understand current trends.
2.  **Behavior Analysis:** Determines when the audience is most active based on region and niche.
3.  **Strategy Output:** The AI generates a customized execution plan.
    *   *Example Output:* "Best posting time is 7:30 PM. Focus on 'Top 5 Mistakes' format for the next 3 days."

---

## 3. Auto vs. Manual Scheduling System

The system operates around the "Best Posting Time" determined by the Study Engine.

### 3.1 Auto Mode (Zero-Touch)
1.  User connects YouTube, Instagram, Facebook via strict **OAuth login**.
2.  Access tokens are encrypted (AES-256) and stored securely in the Admin API Vault.
3.  **System Prompt:** *"आपका account connect हो गया है, अब आपका content समय पर auto upload हो जाएगा"*
4.  **Backend CRON:** The system calculates when to start rendering (e.g., 2 hours before post time) so the video is ready precisely when needed.
5.  Video is uploaded directly via Social APIs.

### 3.2 Manual Mode (Approval Required)
1.  AI suggests the time: *"आपके लिए best posting time 7:30 PM है"*
2.  User accepts or modifies the time.
3.  **System Prompt:** *"मुझे आपके algorithm को समझने के लिए थोड़ा समय चाहिए, मैं आपके post से पहले content तैयार कर दूँगा"*
4.  Video is generated and placed in the dashboard for the user to download, copy the title/tags, and post manually.

---

## 4. The ₹1-₹5 Video Generation Pipeline (Segmented Architecture)

To completely eliminate heavy API costs (like expensive AI video generators), the production is broken down into micro-tasks and stitched together.

### Step 1: Script Generation (Free APIs)
*   **Tools:** DeepSeek (via OpenRouter free tier), Google Gemini Free API, or Groq.
*   **Action:** Generates a viral script based on trending topics.
*   **Cost:** ₹0

### Step 2: Micro-Segmentation
*   The script is split into **8 to 10-second segments**.
*   *Why?* Short segments are easier to process, less prone to TTS errors, and if a rendering job fails, the system only retries a 10-second chunk, saving server load.

### Step 3: Asset Acquisition (Multi-Brain & Browser Automation)
This is where the cost-saving magic happens. The AI acts as a human browsing the web.
*   **Browser Automation (Puppeteer/Playwright):** The AI has access to a pool of pre-authorized Gmail accounts.
*   **Visual Assets:** The backend AI navigates to free stock sites (Pexels, Pixabay) or uses free image generators (Google Imagen, Bing Image Creator) via browser automation to generate B-Roll without using paid APIs.
*   **Voice/Audio:** Uses free/freemium TTS APIs (e.g., Edge TTS) to generate voiceovers for each 8-second segment.
*   **Thumbnails:** Automates a headless browser to open a free Canva template, inject the generated text/image, and export the thumbnail.

### Step 4: Final Assembly (FFmpeg Engine)
*   No heavy cloud rendering services.
*   A backend worker running **FFmpeg** stitches the 8-second segments together.
*   It overlays the audio, adds auto-generated captions (SRT files), and applies simple transitions.
*   **Output:** 1 Long Video, 3 Shorts, SEO Title, Description, Hashtags, and Thumbnail.
*   **Rule:** ❌ No full video recreate allowed (too expensive). ✅ Only script text edits allowed before rendering.

---

## 5. Continuous Processing & Credit Protection

To ensure server stability and prevent users from draining server resources:
1.  **Segmented Saving:** If a video requires 10 segments, each generated segment is saved to a temporary S3/Cloudflare R2 bucket.
2.  **Credit Check Checkpoint:** Before rendering the next segment, the system checks the user's credit balance.
3.  **Pause & Resume:** If credits exhaust during segment 5, the process freezes. The completed segments are saved.
    *   *Action:* Process continues the next day when credits refresh, or when the user buys a top-up.
4.  **Final Output:** The final video is only stitched and shown to the user when all segments are 100% complete.

---

## 6. API Routing Protocol (Cost Control Engine)

When the system needs an AI decision, it follows this strict priority list:
1.  **Priority 1: Prompt-based local logic** (Hardcoded rules, ₹0 cost).
2.  **Priority 2: Free Tier APIs** (Gemini Free, DeepSeek Free, Groq, OpenRouter).
3.  **Priority 3: Browser Automation** (Puppeteer logging into ChatGPT/Claude web interfaces using rotating bot emails).
4.  **Priority 4: Paid APIs** (Absolute last resort, using the cheapest available provider).

---

## 7. Multi-Income & Growth System

While production costs are aggressively kept near zero, the platform monetizes through multiple streams:
1.  **Subscription Plans** (Starter, Growth, Agency).
2.  **SEO Optimization Add-on** (Premium keywords/ranking strategies).
3.  **Ads Commission** (If the platform manages ads, 50% split).
4.  **Affiliate Engine** (₹100 for users, ₹249 for creators).
5.  **Voice Clone Marketplace** (Creators license their voice, 50/50 revenue split with CopixAI).
6.  **Credit Top-ups** (For users who exhaust daily limits).
7.  **Priority Rendering** (Pay to skip the FFmpeg queue).

### Growth Engine Monitoring
The AI constantly monitors the user's linked social channels. If views stagnate, the AI generates a dashboard alert:
*   *"Your organic reach is dropping. Let me generate a specialized SEO strategy, or we can launch a ₹500 ad campaign to boost momentum."*

---
**Status:** Architecture Finalized. Ready for Node.js/Python backend implementation.
