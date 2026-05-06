require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');

async function createHeroAiAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const hashedPassword = await bcrypt.hash('HeroAi_Master_2026', 10);
    
    const heroAiAdmin = new User({
      profile: {
        name: 'HeroAi Official',
        role: 'USER', // Per user request
        niche: 'AI & Technology',
        location: 'Global',
        language: 'en'
      },
      auth: {
        email: 'official@heroai.com',
        password: hashedPassword,
        isVerified: true
      },
      subscription: {
        planId: 'agency',
        dailyVideoQuota: 1000,
        dailyReelQuota: 1000,
        creditsRemaining: 999999
      },
      isSetupComplete: true,
      deviceFingerprint: 'master_server_01'
    });

    await heroAiAdmin.save();
    console.log("SUCCESS: HeroAi Official Admin Created!");
    await mongoose.connection.close();
  } catch (err) {
    console.error("ERROR creating HeroAi Admin:", err);
  }
}

createHeroAiAdmin();
