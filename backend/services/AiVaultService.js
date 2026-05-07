const AiVault = require('../models/AiVault');

class AiVaultService {
  /**
   * Get the best available provider for a specific module (e.g., 'SCRIPT_AI')
   * Prioritizes 'ACTIVE' status, lowest priority number, and ₹0 Cost.
   */
  static async getBestProvider(moduleType) {
    // 🧠 MASTER BRAIN PROTECTION: If it's a script task, hamesha Fixed Gemini check karega
    const providers = await AiVault.find({ 
      module: moduleType, 
      status: 'ACTIVE',
      'usage.costPerCallEstimate': { $lte: 0.00 } // ₹0 COST ENFORCEMENT
    }).sort({ isFixedMaster: -1, priority: 1, 'health.averageResponseTimeMs': 1 });

    if (!providers || providers.length === 0) {
      // Logic for Fallback to BROWSER BOTS (₹0 Cost)
      const browserBots = await AiVault.find({ category: 'BOT', status: 'ACTIVE' });
      if (browserBots.length > 0) return browserBots[0];
      
      throw new Error(`CRITICAL_API_EXHAUSTION: All free APIs for [${moduleType}] are RED.`);
    }

    return providers[0];
  }

  /**
   * Mark an API as RED if it fails critically.
   */
  static async reportFailure(vaultId, errorMessage) {
    const provider = await AiVault.findById(vaultId);
    if (!provider) return;

    provider.health.errorCount += 1;
    // Mark as RED if errors are persistent or it's a 429/403
    if (errorMessage.includes('429') || errorMessage.includes('quota') || provider.health.errorCount > 5) {
      provider.status = 'RED'; // Red = Exhausted/Banned
      provider.resetAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Reset in 24h
    } else {
      provider.status = 'COOLING_DOWN';
      provider.resetAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min cooldown
    }
    
    await provider.save();
    console.log(`[AI VAULT] 🛑 Provider ${provider.provider} set to ${provider.status}. Reason: ${errorMessage}`);
    return provider;
  }

  /**
   * Update usage stats and health on success.
   */
  static async reportSuccess(vaultId, responseTimeMs) {
    const provider = await AiVault.findById(vaultId);
    if (!provider) return;

    provider.health.averageResponseTimeMs = 
      (provider.health.averageResponseTimeMs * 0.8) + (responseTimeMs * 0.2);
    
    provider.usage.dailyCount += 1;
    provider.lastUsedAt = new Date();

    // Auto-Exhaust if daily limit reached
    if (provider.usage.dailyCount >= provider.usage.dailyLimit) {
      provider.status = 'EXHAUSTED';
    }

    await provider.save();
    return provider;
  }
}

module.exports = AiVaultService;

