const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['SUCCESS', 'ERROR', 'INFO', 'WARNING'], default: 'INFO' },
  isRead: { type: Boolean, default: false },
  metadata: {
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'VideoPipeline' },
    link: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
