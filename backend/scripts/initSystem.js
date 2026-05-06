require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

// Import Models
const User = require('../models/User');
const SystemSettings = require('../models/SystemSettings');

const initSystem = async () => {
    const uri = process.env.MONGO_URI;
    try {
        console.log('🚀 INITIALIZING SYSTEM DATABASE...');
        await mongoose.connect(uri);
        console.log('✅ Connected.');

        const collections = await mongoose.connection.db.collections();
        for (let collection of collections) {
            console.log(`🧹 Wiping: ${collection.collectionName}...`);
            await collection.deleteMany({});
        }

        console.log('🌱 Seeding Current Optimized Plans...');
        const defaultSettings = new SystemSettings({
            configType: 'GLOBAL',
            niches: ['Technology', 'Finance', 'Lifestyle', 'Gaming', 'Education', 'Business', 'Health & Fitness', 'Travel', 'Food & Cooking', 'Fashion & Beauty', 'Motivation', 'AI News'],
            plans: {
                beginner: { price: 999, dailyQuota: 2 },
                creator: { price: 4999, dailyQuota: 10 },
                business: { price: 9999, dailyQuota: 25 },
                agency: { price: 24999, dailyQuota: 100 }
            },
            referral: {
                requiredShares: 5,
                freeDaysReward: 3
            }
        });
        await defaultSettings.save();

        // Create a Default Admin if needed
        console.log('👤 Creating Master System Identity...');
        // ... (Optional: add default admin)

        console.log('✨ SYSTEM INITIALIZATION COMPLETE.');
        console.log('✅ All old data cleared.');
        console.log('✅ New Plan Database (Beginner, Creator, Business, Agency) is live.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Init Failed:', err);
        process.exit(1);
    }
};

initSystem();
