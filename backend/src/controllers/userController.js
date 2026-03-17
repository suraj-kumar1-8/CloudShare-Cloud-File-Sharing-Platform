const User = require('../models/User');

// Storage limit per user — 1 GB
const STORAGE_LIMIT_BYTES = 1 * 1024 * 1024 * 1024; // 1 GB

/**
 * GET /api/user/storage
 * Returns the current user's storage usage and limit.
 */
const getStorage = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('storageUsed');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const storageUsed  = Math.max(0, user.storageUsed || 0);
    const storageLimit = STORAGE_LIMIT_BYTES;
    const percentage   = Math.min(100, Math.round((storageUsed / storageLimit) * 100));

    res.json({
      storageUsed,
      storageLimit,
      percentage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStorage };
