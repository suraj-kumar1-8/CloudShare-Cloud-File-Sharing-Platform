const fs   = require('fs');
const path = require('path');
const cron = require('node-cron');
const File = require('../models/File');
const Room = require('../models/Room');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

/**
 * Delete a physical file from disk, ignoring "not found" errors.
 */
const unlinkSafe = (s3Key) => {
  if (!s3Key) return;
  const filePath = path.join(UPLOAD_DIR, s3Key);
  try { fs.unlinkSync(filePath); } catch (_) { /* ignore */ }
};

/**
 * Cron job: runs every 5 minutes.
 * Deletes any File documents whose expiryDate has passed.
 */
const startFileExpiryJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const expired = await File.find({
        expiryDate: { $ne: null, $lte: new Date() },
      });

      if (expired.length === 0) return;
      console.log(`[cron:fileExpiry] Deleting ${expired.length} expired file(s)…`);

      for (const file of expired) {
        unlinkSafe(file.s3Key);
        await file.deleteOne();
      }
    } catch (err) {
      console.error('[cron:fileExpiry] Error:', err.message);
    }
  });

  console.log('✅  File-expiry cron job started (every 5 min)');
};

/**
 * Cron job: runs every 5 minutes.
 * Deletes any Room documents (and their files) whose expiryTime has passed.
 */
const startRoomExpiryJob = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const expiredRooms = await Room.find({ expiryTime: { $lte: new Date() } });

      if (expiredRooms.length === 0) return;
      console.log(`[cron:roomExpiry] Deleting ${expiredRooms.length} expired room(s)…`);

      for (const room of expiredRooms) {
        for (const entry of room.files) {
          // Delete the physical file
          if (entry.fileUrl) {
            const s3Key = entry.fileUrl.split('/uploads/')[1];
            unlinkSafe(s3Key);
          }
          // Delete the File metadata document
          if (entry.fileId) await File.findByIdAndDelete(entry.fileId);
        }
        await room.deleteOne();
      }
    } catch (err) {
      console.error('[cron:roomExpiry] Error:', err.message);
    }
  });

  console.log('✅  Room-expiry cron job started (every 5 min)');
};

module.exports = { startFileExpiryJob, startRoomExpiryJob };
