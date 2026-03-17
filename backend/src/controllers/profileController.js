const path   = require('path');
const fs     = require('fs');
const bcrypt = require('bcryptjs');
const User   = require('../models/User');
const File   = require('../models/File');

// ── GET /api/profile ─────────────────────────────────────────────────────────
exports.getProfile = async (req, res, next) => {
  try {
    const user  = await User.findById(req.user.id).select('-password');
    const total = await File.countDocuments({ uploadedBy: req.user.id });
    res.json({ user, totalFiles: total });
  } catch (err) { next(err); }
};

// ── PATCH /api/profile ───────────────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const update = {};
    if (name)  update.name  = name.trim();
    if (email) update.email = email.trim().toLowerCase();

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Email already in use' });
    next(err);
  }
};

// ── PATCH /api/profile/password ──────────────────────────────────────────────
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both currentPassword and newPassword are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ message: 'New password must be at least 6 characters' });

    const user = await User.findById(req.user.id).select('+password');
    const ok   = await user.comparePassword(currentPassword);
    if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });

    user.password = newPassword;       // pre-save hook hashes it
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) { next(err); }
};

// ── POST /api/profile/avatar ─────────────────────────────────────────────────
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image provided' });

    // Delete old avatar from disk if it's a local upload
    const user = await User.findById(req.user.id);
    if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/avatars/')) {
      const old = path.join(__dirname, '../../uploads', path.basename(user.avatarUrl));
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const updated   = await User.findByIdAndUpdate(
      req.user.id,
      { avatarUrl },
      { new: true }
    ).select('-password');

    res.json({ user: updated });
  } catch (err) { next(err); }
};
