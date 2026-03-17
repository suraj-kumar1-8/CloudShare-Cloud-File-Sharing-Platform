const Notification = require('../models/Notification');

// ── Programmatic helper (call from other controllers) ────────────────────────
/**
 * Create a notification for a user (non-fatal).
 * @param {string} userId
 * @param {'file_uploaded'|'file_shared'|'file_downloaded'|'room_invite'|'download_complete'|'file_expiring'} type
 * @param {string} title
 * @param {string} [message]
 * @param {object} [meta]
 */
exports.createNotification = async (userId, type, title, message = '', meta = {}) => {
  try {
    await Notification.create({ user: userId, type, title, message, meta });
  } catch (_) { /* non-fatal */ }
};

// ── GET /api/notifications ───────────────────────────────────────────────────
exports.getNotifications = async (req, res, next) => {
  try {
    const notifs = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unread = await Notification.countDocuments({ user: req.user.id, read: false });
    res.json({ notifications: notifs, unread });
  } catch (err) { next(err); }
};

// ── PATCH /api/notifications/read-all ────────────────────────────────────────
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

// ── PATCH /api/notifications/:id/read ────────────────────────────────────────
exports.markRead = async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true }
    );
    res.json({ message: 'Notification marked as read' });
  } catch (err) { next(err); }
};

// ── DELETE /api/notifications ─────────────────────────────────────────────────
exports.clearAll = async (req, res, next) => {
  try {
    await Notification.deleteMany({ user: req.user.id });
    res.json({ message: 'All notifications cleared' });
  } catch (err) { next(err); }
};
