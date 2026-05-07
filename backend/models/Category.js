const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  icon: { type: String, default: 'fas fa-folder' },
  niches: [{ type: String }],
  isMonetizable: { type: Boolean, default: false },
  isViral: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);

