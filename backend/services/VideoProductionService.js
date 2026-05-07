const { AssetProviderService, VoiceService } = require('./MediaServices');
const FfmpegEngine = require('./FfmpegEngine');

class VideoProductionService {
    /**
     * Orchestrates the full video production flow.
     */
    static async createFullVideo(pipelineId, scenes, strategy = {}) {
        console.log(`[PRODUCTION] Starting full orchestration for: ${pipelineId} using ${strategy.engine || 'Standard'}`);
        
        try {
            const processedSegments = [];

            for (const scene of scenes) {
                console.log(`[PRODUCTION] Processing Scene ${scene.sceneId}...`);
                
                // 1. Fetch Visual Asset (User Avatar vs Stock vs AI Generation)
                let clipUrl;
                if (strategy.visualType === 'USER_AVATAR') {
                    console.log("[PRODUCTION] Enforcing User Avatar Clone...");
                    clipUrl = "https://path-to-user-cloned-avatar.mp4"; // Real logic would fetch from Vault
                } else {
                    clipUrl = await AssetProviderService.fetchClip(scene.visualPrompt);
                }
                
                // 2. Generate Voice Over (User Clone vs Niche Optimized)
                let audioUrl;
                if (strategy.voiceType === 'USER_CLONE') {
                    console.log("[PRODUCTION] Enforcing User Voice Clone...");
                    audioUrl = "https://path-to-user-cloned-voice.mp3";
                } else {
                    audioUrl = await VoiceService.generateAudio(scene.text);
                }
                
                processedSegments.push({
                    isCompleted: true,
                    videoClipUrl: clipUrl,
                    audioUrl: audioUrl,
                    text: scene.text
                });
            }

            // 3. Assemble all segments into one cinematic video
            const finalPath = await FfmpegEngine.stitchSegments(pipelineId, processedSegments);
            
            return {
                status: 'COMPLETED',
                finalPath: finalPath,
                segmentsCount: processedSegments.length
            };

        } catch (err) {
            console.error(`[PRODUCTION] Failed:`, err);
            throw err;
        }
    }
}

module.exports = VideoProductionService;

