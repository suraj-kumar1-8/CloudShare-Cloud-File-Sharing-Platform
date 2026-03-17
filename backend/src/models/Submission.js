const mongoose = require('mongoose');

/**
 * Submission schema
 * Represents a single student's assignment upload for a room.
 */
const submissionSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: [100, 'Student name must be at most 100 characters'],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room is required'],
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Efficient querying by room + newest first
submissionSchema.index({ room: 1, uploadedAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);
