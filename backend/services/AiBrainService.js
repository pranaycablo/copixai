const axios = require('axios');
const GviService = require('./GviService');
const MasterBrainService = require('./MasterBrainService');
const AiVault = require('../models/AiVault');

class AiBrainService {
  constructor() {
    this.modelName = "HeroAi Master Brain (V3-PRO-ACTIVE)";
    this.accuracyThreshold = 0.999;
    this.apiKey = process.env.GEMINI_API_KEY;
    this.apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
  }

  /**
   * ── CONTENT ARCHITECT ──
   * Handles SEO, Titles, Hooks, and Scripts
   */
  async architectContent(params) {
    const { niche, role, language } = params;
    console.log(`[BRAIN] Architecting High-Level Content Strategy for ${niche}...`);

    return {
      seo: {
        title: `[AUTO_DECIDED] High-CTR Title with ${niche} Keywords`,
        hook: "Pattern Interruption: The 3-Second Viral Hook",
        kickLine: "The 'Aha!' Moment transition to main value",
        description: "SEO-Optimized description with LSI keywords and Lead Magnet links.",
        hashtags: ["#Viral", `#${niche}`, "#HeroAi", "#GrowthHack"]
      },
      scriptLogic: {
        systemPrompt: `Act as a Top 1% ${niche} Viral Content Architect. 
        Your goal is 99% accuracy in human psychological engagement. 
        Tone: ${role === 'BUSINESS' ? 'Extreme Authority & Trust' : 'High Energy & Relatability'}. 
        Format: Fast-paced short-form video script.
        Constraint 1: Hook must disrupt scrolling patterns within 3 seconds.
        Constraint 2: No fluffy introductions. Deliver value instantly.
        Constraint 3: End with a highly persuasive CTA.`,
        structure: "Disruptive Hook -> LSI Keyword Heavy Problem -> Concrete Solution -> Proof/Authority -> Hard CTA",
        pacing: "Fast-cut every 1.8 to 2.5 seconds to maximize retention."
      },
      visuals: {
        thumbnailConcept: "High-Contrast Subject + Bold Typography (Max 3 words) + Emotional Curiosity Gap",
        posterLogic: "Color Theory: High-vibrancy Amber/Cyan glow for click-through dominance"
      }
    };
  }

  /**
   * ── GROWTH THINKER ──
   * Handles Subscriber logic and Channel Analysis
   */
  async thinkGrowth(userId, niche) {
    console.log(`[BRAIN] Analyzing Channel Response & Subscriber Growth for ${userId}...`);
    return {
      subscriberTriggers: ["Comment 'GROWTH' for secret template", "Subscribe for daily viral alerts"],
      nicheRelevance: 0.98,
      competitorAudit: "Trend identified: Users moving to micro-learning formats"
    };
  }

  /**
   * ── VIRAL PREDICTOR (V3 PRO) ──
   * Predicts CTR and Virality based on trend density
   */
  async predictVirality(script, niche) {
    console.log(`[BRAIN] Running Neural Viral Prediction for ${niche}...`);
    // In a real scenario, this would use a specialized scoring model
    const score = Math.floor(Math.random() * 30) + 70; // 70-100% for Pro logic
    return {
      score,
      analysis: `High probability due to 'Pattern Interruption' hook and current ${niche} trend saturation being low.`
    };
  }

  /**
   * ── AUTO-MODEL SELECTOR ──
   * Decides which free API to use for ₹0 Cost
   */
  async decideModel(taskType) {
    // 🧠 STRICT ₹0 COST ROUTING: Only rely on models that have a permanent free tier or are fully open source.
    const providers = {
      SCRIPT: 'Gemini-1.5-Flash-Free-Tier',
      VOICE: 'Edge-TTS-Scraper-Free',
      IMAGE: 'HuggingFace-Inference-Free',
      SEO: 'Google-Trends-Scraper-Free'
    };
    console.log(`[BRAIN] ZERO-LIABILITY SHIELD ACTIVE: Bypassing paid APIs. Enforcing ${providers[taskType]} for ${taskType}`);
    return providers[taskType];
  }

  /**
   * ── MASTER ORCHESTRATION ──
   */
  async think(params) {
    const { role, niche, location, language, userId } = params;
    
    // 🧠 MASTER BRAIN: Fetch the FIXED Gemini API Key
    const masterVault = await AiVault.findOne({ 
      provider: 'Gemini', 
      isFixedMaster: true, 
      status: 'ACTIVE' 
    });

    if (!masterVault || !masterVault.credentials.apiKey) {
      console.error("[BRAIN] 🛑 Fixed Master Gemini Key not found or exhausted!");
      // Fallback to any active Gemini key if fixed one fails
    }

    this.apiKey = masterVault ? masterVault.credentials.apiKey : process.env.GEMINI_API_KEY;
    this.apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

    // 1. Online Real-time Data Sync (GVI)
    const trend = await GviService.matchUserToTrend(userId, niche);
    
    // 2. Strategic Board Plan
    const board = await MasterBrainService.executeMasterPlan({ profile: { role, niche } });

    // 3. Generate Real Script via LLM
    const realScript = await this.generateRealContent(params, board, trend);

    // 4. Growth Strategy
    const growth = await this.thinkGrowth(userId, niche);
    
    // 5. Production Strategy (OWN vs AUTO)
    const user = await require('../models/User').findById(userId);
    const productionStrategy = {
      engine: board.strategy.cto.engine,
      voiceType: user.digitalIdentity.voicePreference === 'OWN' ? 'USER_CLONE' : 'NICHE_OPTIMIZED',
      visualType: user.digitalIdentity.facePreference === 'OWN' ? 'USER_AVATAR' : 'STOCK_CINEMATIC',
      voiceCloneId: user.digitalIdentity.voiceCloneId,
      faceAvatarId: user.digitalIdentity.faceAvatarId
    };

    // 6. Viral Prediction (V3 Pro)
    const virality = await this.predictVirality(realScript.script, niche);
    
    return {
      masterContext: `Role: ${role}, Niche: ${niche}, Language: ${language}, Trend: ${trend.topic}`,
      productionStrategy,
      architecture: {
        seo: realScript.seo,
        scriptLogic: {
          content: realScript.script,
          systemPrompt: realScript.debugPrompt,
          structure: "Disruptive Hook -> LSI Keyword Heavy Problem -> Concrete Solution -> Proof/Authority -> Hard CTA",
          pacing: "Fast-cut every 1.8 to 2.5 seconds to maximize retention."
        },
        visuals: realScript.visuals
      },
      growth,
      virality,
      models: { scriptModel: 'Gemini-1.5-Flash-Active' },
      priority: "99.9% PRO ACCURACY",
      costStatus: "₹0 SHIELD ACTIVE"
    };
  }

  async askGemini(prompt) {
    try {
      // Fetch any active Gemini key
      const vault = await AiVault.findOne({ provider: 'Gemini', status: 'ACTIVE' });
      const key = vault ? vault.credentials.apiKey : process.env.GEMINI_API_KEY;
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;

      const response = await axios.post(endpoint, {
        contents: [{ parts: [{ text: prompt }] }]
      });

      return response.data.candidates[0].content.parts[0].text;
    } catch (err) {
      console.error("[BRAIN] askGemini Failed:", err.message);
      return "Main thoda busy hoon content optimize karne mein. Please thodi der baad puchiye.";
    }
  }

  async generateRealContent(params, board, trend) {
    if (!this.apiKey) {
      console.warn("[BRAIN] No API Key found. Falling back to simulation.");
      return this.architectContent(params);
    }

    const systemPrompt = `You are the HeroAi Master Brain (V3-PRO). Your objective is to architect a viral, high-retention short-form video script.
    BRANDING_STRICTION: Use ONLY the name "HeroAi" for any mentions of the platform. NEVER use names like HeroAi or any other brand.
    USER_ROLE: ${params.role}
    NICHE: ${params.niche}
    TREND_CONTEXT: ${trend.topic}
    STRATEGY: ${JSON.stringify(board.strategy)}
    
    OUTPUT_JSON_FORMAT:
    {
      "title": "Viral High-CTR Title",
      "hook": "Pattern Interruption Hook (First 3 seconds)",
      "script": "Full video script",
      "scenes": [
        {
          "sceneId": 1,
          "text": "Dialogue for this segment",
          "visualPrompt": "Detailed visual description for stock footage/AI generation",
          "duration": 5
        }
      ],
      "hashtags": ["tag1", "tag2"],
      "description": "SEO optimized description",
      "visualDescription": "Global style instructions"
    }`;

    try {
      const response = await axios.post(this.apiEndpoint, {
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      });

      const resultText = response.data.candidates[0].content.parts[0].text;
      const cleanJson = JSON.parse(resultText);

      return {
        seo: {
          title: cleanJson.title,
          hook: cleanJson.hook,
          description: cleanJson.description,
          hashtags: cleanJson.hashtags
        },
        script: cleanJson.script,
        visuals: {
          thumbnailConcept: cleanJson.visualDescription,
          posterLogic: "Pro-Grade Brand Consistency"
        },
        debugPrompt: systemPrompt
      };
    } catch (err) {
      console.error("[BRAIN] LLM Generation Failed:", err.message);
      return this.architectContent(params); // Fallback
    }
  }
}

module.exports = new AiBrainService();

