const mongoose = require('mongoose');
require('dotenv').config();

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/heroai');
    console.log('Connected to DB. Dropping faulty indexes...');
    
    const db = mongoose.connection.db;
    const collection = db.collection('users');
    
    const indexes = await collection.indexes();
    console.log('Current Indexes:', indexes.map(i => i.name));
    
    try {
      await collection.dropIndex('referrals.referralCode_1');
      console.log('Dropped referrals.referralCode_1');
    } catch (e) {
      console.log('Index referrals.referralCode_1 not found or already dropped.');
    }
    
    try {
      await collection.dropIndex('billing.paymentSourceId_1');
      console.log('Dropped billing.paymentSourceId_1');
    } catch (e) {
      console.log('Index billing.paymentSourceId_1 not found or already dropped.');
    }
    
    console.log('Indexes fixed! Live DB is now ready.');
  } catch(e) {
    console.error('Error:', e);
  } finally {
    process.exit(0);
  }
}
fixIndexes();
