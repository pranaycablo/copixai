const axios = require('axios');
const User = require('../models/User');
const SecurityService = require('./SecurityService');

class OAuthRefreshService {
  /**
   * Initializes the Token Refresh Worker.
   * Runs periodically to ensure all social tokens are alive.
   */
  static init() {
    const cron = require('node-cron');
    console.log('[OAUTH REFRESH] Worker active. Monitoring token lifecycles...');

    // Run every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      await this.refreshAllTokens();
    });
  }

  static async refreshAllTokens() {
    try {
      const users = await User.find({ 'socialLinks.isConnected': true });
      console.log(`[OAUTH REFRESH] Checking tokens for ${users.length} users...`);

      for (const user of users) {
        for (const link of user.socialLinks) {
          if (link.isConnected && link.refreshToken) {
            await this.processRefresh(user, link);
          }
        }
      }
    } catch (err) {
      console.error('[OAUTH REFRESH] Global Worker Error:', err.message);
    }
  }

  static async processRefresh(user, link) {
    try {
      const decryptedRefreshToken = SecurityService.decrypt(link.refreshToken);
      let refreshUrl = '';
      let payload = {};

      if (link.platform === 'YOUTUBE') {
        refreshUrl = 'https://oauth2.googleapis.com/token';
        payload = {
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: decryptedRefreshToken,
          grant_type: 'refresh_token'
        };
      } else if (link.platform === 'INSTAGRAM') {
        // Instagram/Meta use long-lived tokens that need refresh every 60 days
        refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${SecurityService.decrypt(link.accessToken)}`;
      }

      if (!refreshUrl) return;

      console.log(`[OAUTH REFRESH] Attempting refresh for ${user.auth.email} on ${link.platform}`);
      
      const response = link.platform === 'INSTAGRAM' ? await axios.get(refreshUrl) : await axios.post(refreshUrl, payload);
      
      if (response.data.access_token) {
        link.accessToken = SecurityService.encrypt(response.data.access_token);
        if (response.data.refresh_token) {
          link.refreshToken = SecurityService.encrypt(response.data.refresh_token);
        }
        await user.save();
        console.log(`[OAUTH REFRESH] ✅ Token successfully rotated for ${link.platform}`);
      }
    } catch (err) {
      console.warn(`[OAUTH REFRESH] 🛑 Refresh failed for user ${user._id} on ${link.platform}:`, err.message);
      // If refresh fails critically, we could notify the user to re-link
    }
  }
}

module.exports = OAuthRefreshService;
