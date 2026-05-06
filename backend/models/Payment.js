const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transactionId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  gateway: { type: String, enum: ['STRIPE', 'RAZORPAY', 'PAYPAL'], required: true },
  status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
  planId: { type: String },
  metadata: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
