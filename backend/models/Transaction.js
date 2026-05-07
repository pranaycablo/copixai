const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  planId: { type: String },
  status: { type: String, enum: ['SUCCESS', 'FAILED', 'PENDING'], default: 'SUCCESS' },
  costToCompany: { type: Number, default: 0 }, // API costs etc.
  taxAmount: { type: Number, default: 0 }, // 30% tax
  netProfit: { type: Number, default: 0 }
}, { timestamps: true });

// Pre-save hook to calculate tax and net profit
TransactionSchema.pre('save', function(next) {
  this.taxAmount = this.amount * 0.30;
  this.netProfit = this.amount - this.taxAmount - this.costToCompany;
  next();
});

module.exports = mongoose.model('Transaction', TransactionSchema);

