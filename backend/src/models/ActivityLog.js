const mongoose = require('mongoose');

/**
 * ActivityLog schema.
 * Records every meaningful action taken on a file.
 */
const activityLogSchema = new mongoose.Schema(
  {
    actionType: {
      type:     String,
      required: true,
      enum: ['uploaded', 'downloaded', 'shared', 'share_revoked', 'share_emailed', 'deleted', 'previewed', 'renamed'],
    },
    fileId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'File',
      required: true,
    },
    performedBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      default:  null, // null = anonymous (e.g. public share-link download)
    },
    // Optional extra context (e.g. recipient email for share_emailed)
    meta: {
      type:    mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

// Fast reads by fileId (the timeline query)
activityLogSchema.index({ fileId: 1, createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
