const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  identifier: { type: String, required: true, index: true }, // email or phone
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 } // Auto-delete after 10 mins
});

module.exports = mongoose.model('OTP', OTPSchema);

