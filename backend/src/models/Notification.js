const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type:    {
      type: String,
      enum: ['file_uploaded', 'file_shared', 'file_downloaded', 'room_invite', 'download_complete', 'file_expiring'],
      required: true,
    },
    title:   { type: String, required: true },
    message: { type: String, default: '' },
    read:    { type: Boolean, default: false, index: true },
    meta:    { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
