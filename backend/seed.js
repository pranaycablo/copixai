const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/HeroAi';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB...');

    // Clear existing users for a fresh test
    await User.deleteMany({ 'auth.email': 'pranayHeroAi@hero.ai' });

    const admin = new User({
      auth: {
        email: 'pranayHeroAi@hero.ai',
        password: '9263793375', // In real app, this would be hashed
        phone: '9263793375'
      },
      profile: {
        name: 'Master Admin',
        role: 'ADMIN',
        nicheCategory: 'all'
      },
      subscription: {
        planId: 'agency',
        creditsRemaining: 9999,
        status: 'ACTIVE'
      }
    });

    await admin.save();
    console.log('✅ Admin User Created: admin@HeroAi.com / adminpassword123');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Failed:', err.message);
    process.exit(1);
  }
}

seed();


