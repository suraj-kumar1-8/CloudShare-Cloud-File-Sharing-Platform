const mongoose = require('mongoose');
const crypto   = require('crypto');

/**
 * Room schema.
 * A temporary sharing room whose files are auto-deleted on expiry.
 */
const roomSchema = new mongoose.Schema(
  {
    roomName: {
      type:     String,
      required: [true, 'Room name is required'],
      trim:     true,
      maxlength: [80, 'Room name must be at most 80 characters'],
    },
    // Short, human-friendly unique identifier used in the share URL
    roomId: {
      type:    String,
      unique:  true,
      default: () => crypto.randomBytes(5).toString('hex'), // e.g. "a3f9c12e"
    },
    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    // When the room (and all its files) will be automatically deleted.
    expiryTime: {
      type:     Date,
      required: [true, 'Expiry time is required'],
    },
    // Optional submission deadline (can be earlier than expiryTime)
    deadline: {
      type: Date,
      default: null,
    },
    // Whether uploads after the deadline are allowed (they'll be marked as Late on the UI)
    allowLateSubmissions: {
      type:    Boolean,
      default: false,
    },
    // Files uploaded directly to this room (metadata mirrors the File collection)
    files: [
      {
        fileId:       { type: mongoose.Schema.Types.ObjectId, ref: 'File' },
        originalName: String,
        fileSize:     Number,
        fileType:     String,
        fileUrl:      String,
        // Who uploaded this file into the room
        uploadedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        uploadedAt:   { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// The cron job queries by expiryTime
roomSchema.index({ expiryTime: 1 });

module.exports = mongoose.model('Room', roomSchema);
