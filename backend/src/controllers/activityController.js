const ActivityLog = require('../models/ActivityLog');

/**
 * Helper used by other controllers to record a file action.
 * Not exported as an HTTP handler — called programmatically.
 *
 * @param {'uploaded'|'downloaded'|'shared'|'share_revoked'|'share_emailed'|'deleted'|'previewed'} actionType
 * @param {ObjectId|string} fileId
 * @param {ObjectId|string|null} performedBy  – user id, or null for anonymous
 * @param {object} [meta] – extra context
 */
const logActivity = async (actionType, fileId, performedBy = null, meta = null) => {
  try {
    await ActivityLog.create({ actionType, fileId, performedBy, meta });
  } catch (err) {
    // non-fatal — never crash the main request if logging fails
    console.warn('[ActivityLog] Failed to write entry:', err.message);
  }
};

/**
 * GET /api/files/activity/:fileId
 * Returns the activity timeline for a file (owner only, enforced in the route).
 */
const getFileActivity = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find({ fileId: req.params.fileId })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('performedBy', 'name email')
      .lean();

    res.json({ activity: logs });
  } catch (error) {
    next(error);
  }
};

module.exports = { logActivity, getFileActivity };
