# HeroAi - Production Backend Engine

This backend is architected for the **HeroAi Automated Growth Studio**. It operates on a "Zero-Cost Orchestration" model, utilizing auto-rotating Free APIs, Headless Browser Bots (Puppeteer), and micro-segmented video rendering (FFmpeg) to achieve massive scale with near-zero production costs.

## 🚀 Pre-Deployment Checklist (Final Touch)

To take this platform live globally, follow these exact steps:

### 1. Database Connection (MongoDB Atlas)
The current system uses a local MongoDB URI. For production:
- Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- Get the Connection String.
- Create a `.env` file in this directory and add:
  ```env
  MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/copixai
  PORT=5000
  JWT_SECRET=your_super_secret_key
  ```

### 2. FFmpeg Installation
The server requires FFmpeg installed at the OS level to process videos.
- **Ubuntu/Debian Server:** `sudo apt install ffmpeg`
- **Windows Server:** Download binaries and add to PATH.

### 3. API Vault Seeding (Admin Task)
Once the server is running, log into the `admin.html` panel and add:
- At least 5 Free Tier API Keys (Groq, Gemini, OpenRouter).
- At least 3 Gmail Accounts for Browser Bot operations.
- Your Razorpay and Stripe keys.

### 4. Hosting Recommendation
- **Backend:** Render.com, AWS EC2, or DigitalOcean Droplet (Requires at least 2GB RAM for Puppeteer/FFmpeg).
- **Frontend:** Vercel, Netlify, or Cloudflare Pages.
- **Storage (Video Files):** AWS S3 or Cloudflare R2 (Cheaper egress fees for video).

## 🛠️ System Architecture Recap
1. `server.js`: API Router and Gateway.
2. `services/AiVaultService.js`: The Auto-Healer. Monitors API health and swaps keys instantly if one fails.
3. `services/BrowserBot.js`: Logs into websites automatically to get free assets (Zero API cost).
4. `services/FfmpegEngine.js`: Combines 10-second video segments into final Shorts/Reels safely.

*Engineered for Scale. Built for Growth.*
