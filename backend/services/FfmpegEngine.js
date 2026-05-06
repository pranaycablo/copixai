const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

class FfmpegEngine {
  /**
   * Stitches multiple 8-10 second video segments together.
   * Used to prevent memory crashes by keeping rendering jobs small.
   */
  static async stitchSegments(pipelineId, segmentsArray) {
    return new Promise((resolve, reject) => {
      console.log(`[FFMPEG ENGINE] Starting merge for pipeline: ${pipelineId}`);
      
      const outputFilename = path.join(__dirname, `../temp/final_${pipelineId}.mp4`);
      
      // Ensure temp directory exists
      if (!fs.existsSync(path.join(__dirname, '../temp'))) {
        fs.mkdirSync(path.join(__dirname, '../temp'));
      }

      const command = ffmpeg();

      // Add all completed segment files to the FFmpeg command
      segmentsArray.forEach(segment => {
        if(segment.isCompleted && segment.videoClipUrl) {
          command.input(segment.videoClipUrl);
        }
      });

      command
        .on('error', (err) => {
          console.error('[FFMPEG ENGINE] Error stitching video:', err.message);
          reject(err);
        })
        .on('end', () => {
          console.log(`[FFMPEG ENGINE] Merging successful. Output: ${outputFilename}`);
          resolve(outputFilename);
        })
        .videoCodec('libx264')
        .outputOptions([
          '-crf 20',        // Best Quality for Viral Growth (18-22 is sweet spot)
          '-preset slow',     // Slower encoding for higher quality compression
          '-movflags +faststart' // Optimize for web playback
        ])
        .mergeToFile(outputFilename, path.join(__dirname, '../temp'));
    });
  }
}

module.exports = FfmpegEngine;
