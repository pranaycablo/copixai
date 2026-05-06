const AiVault = require('../models/AiVault');

class AiVaultService {
  /**
   * Get the best available provider for a specific module (e.g., 'SCRIPT_AI')
   * Prioritizes 'ACTIVE' status, lowest priority number (e.g., 1 = Free API), and fastest response time.
   */
  static async getBestProvider(moduleType) {
    // 🧠 ZERO LIABILITY SHIELD:
    // Priority 1: STRICTLY Use FREE APIs ONLY (costPerCallEstimate === 0).
    // Priority 2: If Free is out, use Browser Automation (Bots) which are free.
    // If all free resources are exhausted, PAUSE. DO NOT use paid APIs.
    
    const providers = await AiVault.find({ 
      module: moduleType, 
      status: 'ACTIVE',
      'usage.costPerCallEstimate': { $lte: 0.00 } // STRICT ₹0 COST ENFORCEMENT
    }).sort({ priority: 1, 'health.averageResponseTimeMs': 1 });

    if (!providers || providers.length === 0) {
      // Logic for Browser Fallback (₹0 Cost)
      const browserBots = await AiVault.find({ category: 'BOT', status: 'ACTIVE' });
      if (browserBots.length > 0) return browserBots[0];
      
      throw new Error(`CRITICAL_LIABILITY_BLOCK: All free APIs for [${moduleType}] exhausted. Queue paused to prevent billing.`);
    }

    return providers[0];
  }

  /**
   * If an API fails (e.g. Rate Limit 429), mark it as COOLING_DOWN.
   * The AI Auto-Healer will use the next available API.
   */
  static async reportFailure(vaultId) {
    const provider = await AiVault.findById(vaultId);
    if (!provider) return;

    provider.health.errorCount += 1;
    // If it fails, isolate it to prevent further errors
    provider.status = 'COOLING_DOWN';
    provider.resetAt = new Date(Date.now() + 60 * 60 * 1000); // Reset in 1 hour
    
    await provider.save();
    console.log(`[AUTO-HEALER] ⚠️ Provider ${provider.provider} isolated. Status set to COOLING_DOWN.`);
    return provider;
  }

  /**
   * Report success to keep tracking the health and response speed.
   */
  static async reportSuccess(vaultId, responseTimeMs) {
    const provider = await AiVault.findById(vaultId);
    if (!provider) return;

    // Moving average of response time
    provider.health.averageResponseTimeMs = 
      (provider.health.averageResponseTimeMs * 0.8) + (responseTimeMs * 0.2);
    
    provider.usage.dailyCount += 1;

    // Auto exhaust if daily limit reached
    if (provider.usage.dailyCount >= provider.usage.dailyLimit) {
      provider.status = 'EXHAUSTED';
      console.log(`[AUTO-HEALER] 🛑 Provider ${provider.provider} hit daily limit. Set to EXHAUSTED.`);
    }

    await provider.save();
    return provider;
  }
}

module.exports = AiVaultService;
