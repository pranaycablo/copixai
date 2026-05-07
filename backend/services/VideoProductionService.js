const VaultService = require('./VaultService');

/**
 * Stateful Video Production Service
 * Breaks down generation into atomic steps with checkpoint persistence.
 */
class VideoProductionService {
  async generateVideo(taskId, taskDetails) {
    const state = { taskId, step: 'INITIAL', data: {} };
    
    try {
      // STEP 1: Scripting
      state.step = 'SCRIPTING';
      state.data.script = await this.executeWithRetry('GEMINI', 'generateScript', taskDetails);
      
      // STEP 2: Voiceover
      state.step = 'VOICEOVER';
      state.data.audioUrl = await this.executeWithRetry('ELEVENLABS', 'generateVoice', state.data.script);
      
      // STEP 3: Visuals (WAN/LTX-2)
      state.step = 'VISUALS';
      state.data.videoSegments = await this.executeWithRetry('VIDEO_ENGINE', 'generateSegments', state.data.script);
      
      // STEP 4: Final Assembly (FFmpeg)
      state.step = 'ASSEMBLY';
      return await this.assembleFinal(state.data);
      
    } catch (err) {
      console.error(`[PRODUCTION-ERROR] Failed at ${state.step}:`, err);
      // Persist state to DB for resume
      await this.persistTaskState(taskId, state);
      throw err;
    }
  }

  async executeWithRetry(provider, method, payload) {
    let attempts = 0;
    while (attempts < 5) {
      const apiKey = await VaultService.getValidKey(provider);
      try {
        // Mocking the call to actual engine
        return await this.callAIEngine(method, payload, apiKey);
      } catch (err) {
        if (this.isKeyError(err)) {
          await VaultService.blacklistKey(apiKey);
          attempts++;
          console.warn(`[RETRY] Key failed, rotating to next... (Attempt ${attempts})`);
        } else {
          throw err;
        }
      }
    }
    throw new Error('All keys exhausted for this provider.');
  }

  isKeyError(err) {
    const codes = [401, 402, 429];
    return codes.includes(err.status) || err.message.includes('credit');
  }
}

module.exports = new VideoProductionService();
