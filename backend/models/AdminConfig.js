const mongoose = require('mongoose');

const AdminConfigSchema = new mongoose.Schema({
  _id: { type: String, default: 'master_config' }, // Only one document will ever exist
  paymentGateways: {
    india: {
      razorpay: {
        keyId: { type: String, default: '' },
        keySecret: { type: String, default: '' },
        isActive: { type: Boolean, default: true }
      },
      phonepe: {
        merchantId: { type: String, default: '' },
        saltKey: { type: String, default: '' },
        isActive: { type: Boolean, default: false }
      },
      cashfree: {
        appId: { type: String, default: '' },
        secretKey: { type: String, default: '' },
        isActive: { type: Boolean, default: false }
      }
    },
    global: {
      stripe: {
        publicKey: { type: String, default: '' },
        secretKey: { type: String, default: '' },
        isActive: { type: Boolean, default: true }
      },
      paypal: {
        clientId: { type: String, default: '' },
        clientSecret: { type: String, default: '' },
        isActive: { type: Boolean, default: false }
      }
    }
  },
  geoPricing: {
    IN: {
      starter: { type: Number, default: 999 },
      growth: { type: Number, default: 2999 },
      agency: { type: Number, default: 9999 },
      currency: { type: String, default: 'INR' }
    },
    US: {
      starter: { type: Number, default: 15 },
      growth: { type: Number, default: 39 },
      agency: { type: Number, default: 129 },
      currency: { type: String, default: 'USD' }
    },
    GLOBAL: {
      starter: { type: Number, default: 19 },
      growth: { type: Number, default: 49 },
      agency: { type: Number, default: 149 },
      currency: { type: String, default: 'USD' }
    }
  },
  systemHealth: {
    dailyCostCap: { type: Number, default: 500 },
    killSwitches: {
      allVideoGenerationPaused: { type: Boolean, default: false },
      withdrawalProcessingFrozen: { type: Boolean, default: false }
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('AdminConfig', AdminConfigSchema);
