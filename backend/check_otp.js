const mongoose = require('mongoose');
const OTP = require('./models/OTP');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/heroai');
  const identifier = 'test_debug_' + Date.now();
  
  console.log('Inserting OTP for:', identifier);
  await OTP.findOneAndUpdate(
    { identifier },
    { otp: '111111', createdAt: new Date() },
    { upsert: true, new: true }
  );

  const docs = await OTP.find({ identifier });
  console.log('Docs immediately after:', docs);
  process.exit(0);
}
run();
