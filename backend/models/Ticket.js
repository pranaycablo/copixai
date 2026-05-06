const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  details: { type: String, required: true },
  attachments: [{ type: String }], // URLs to images/files
  status: { type: String, enum: ['OPEN', 'RESOLVED', 'PENDING'], default: 'OPEN' },
  assignedManager: { type: String }, // Aria, Zara, etc.
  priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);
