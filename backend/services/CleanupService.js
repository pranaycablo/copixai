const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const VideoPipeline = require('../models/VideoPipeline');

class CleanupService {
  /**
   * Initializes the 24-hour cleanup job.
   * Runs every hour to check for videos that need to be deleted.
   */
  static init() {
    console.log('[CLEANUP SERVICE] Initializing 24h Data Lifecycle Monitor...');
    
    // Run every hour
    cron.schedule('0 * * * *', async () => {
      console.log('[CLEANUP SERVICE] Scanning for expired content...');
      await this.cleanupExpiredVideos();
    });
  }

  static async cleanupExpiredVideos() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      // Find jobs that are READY or POSTED_LIVE and were created > 24h ago
      const expiredJobs = await VideoPipeline.find({
        status: { $in: ['READY', 'POSTED_LIVE', 'FAILED'] },
        updatedAt: { $lt: twentyFourHoursAgo }
      });

      console.log(`[CLEANUP SERVICE] Found ${expiredJobs.length} expired jobs.`);

      for (const job of expiredJobs) {
        // Delete local file if it exists
        if (job.videoUrl && job.videoUrl.startsWith('/temp/')) {
          const filePath = path.join(__dirname, '../', job.videoUrl);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`[CLEANUP SERVICE] Deleted file: ${filePath}`);
          }
        }

        // Update status to ARCHIVED/DELETED
        job.status = 'ARCHIVED';
        job.videoUrl = null; // Remove URL to prevent 404s
        await job.save();
      }
    } catch (err) {
      console.error('[CLEANUP SERVICE] Error during cleanup:', err.message);
    }
  }
}

module.exports = CleanupService;
