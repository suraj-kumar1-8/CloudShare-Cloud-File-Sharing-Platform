const File   = require('../models/File');
const Folder = require('../models/Folder');
const Room   = require('../models/Room');
const User   = require('../models/User');

// Storage limit per user — 1 GB
const STORAGE_LIMIT_BYTES = 1 * 1024 * 1024 * 1024;

/**
 * Format bytes into a human-readable string (KB, MB, GB).
 */
const formatBytes = (bytes = 0) => {
  if (!bytes || bytes === 0) return '0 B';
  const k     = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i     = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

/**
 * GET /api/dashboard
 *
 * Returns an aggregated summary for the authenticated user's dashboard:
 *   - total / recent files
 *   - total / recent folders
 *   - total / recent rooms (with expiry status)
 *   - storage usage
 */
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now    = new Date();

    // Run all queries in parallel for performance
    const [
      totalFiles,
      recentFiles,
      totalFolders,
      recentFolders,
      totalRooms,
      recentRooms,
      user,
    ] = await Promise.all([
      // File counts & recents
      File.countDocuments({ uploadedBy: userId }),
      File.find({ uploadedBy: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('originalName fileName fileSize fileType fileUrl createdAt shareToken expiryDate folderId')
        .lean(),

      // Folder counts & recents
      Folder.countDocuments({ createdBy: userId }),
      Folder.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      // Room counts & recents
      Room.countDocuments({ createdBy: userId }),
      Room.find({ createdBy: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('roomName roomId expiryTime files createdAt')
        .lean(),

      // User storage info
      User.findById(userId).select('storageUsed name email avatarUrl').lean(),
    ]);

    // Annotate files with human-readable size
    const annotatedFiles = recentFiles.map((f) => ({
      ...f,
      fileSizeHuman: formatBytes(f.fileSize),
      hasShareLink:  !!f.shareToken,
    }));

    // Annotate rooms with expired flag + file count
    const annotatedRooms = recentRooms.map((r) => ({
      ...r,
      isExpired: now > new Date(r.expiryTime),
      fileCount: r.files?.length ?? 0,
      // Don't expose the full files array in the listing
      files: undefined,
    }));

    // Storage numbers
    const storageUsed  = Math.max(0, user?.storageUsed ?? 0);
    const storageLimit = STORAGE_LIMIT_BYTES;
    const storagePercentage = Math.min(100, Math.round((storageUsed / storageLimit) * 100));

    res.json({
      user: {
        name:      user?.name,
        email:     user?.email,
        avatarUrl: user?.avatarUrl ?? null,
      },
      stats: {
        totalFiles,
        totalFolders,
        totalRooms,
        storageUsed,
        storageLimit,
        storagePercentage,
        storageUsedHuman:  formatBytes(storageUsed),
        storageLimitHuman: formatBytes(storageLimit),
      },
      recentFiles:   annotatedFiles,
      recentFolders,
      recentRooms:   annotatedRooms,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
