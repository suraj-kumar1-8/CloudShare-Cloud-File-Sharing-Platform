const mongoose = require('mongoose');

/**
 * File schema.
 * Stores metadata about files uploaded to S3.  The actual binary
 * data lives in the S3 bucket; only the URL is persisted here.
 */
const fileSchema = new mongoose.Schema(
  {
    fileName: {
      type:     String,
      required: [true, 'File name is required'],
      trim:     true,
    },
    originalName: {
      type:  String,
      trim:  true,
    },
    fileSize: {
      type:     Number,
      required: [true, 'File size is required'],
    },
    fileType: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type:     String,
      required: [true, 'File URL is required'],
    },
    s3Key: {
      // S3 object key – used when deleting the file from the bucket
      type:     String,
      required: [true, 'S3 key is required'],
    },
    uploadedBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Uploaded by is required'],
    },
    // How many times this file has been downloaded (owner + shared links).
    downloadCount: {
      type:    Number,
      default: 0,
    },
    // Timestamp of the most-recent download (null until first download).
    lastDownloadedAt: {
      type:    Date,
      default: null,
    },
    // Optional folder this file belongs to.  null = root (no folder).
    folderId: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'Folder',
      default: null,
    },
    // ── Expiring share links ──────────────────────────────────────────────────
    // Randomly-generated token embedded in the public share URL.
    // null = no active share link.
    shareToken: {
      type:    String,
      default: null,
    },
    // When set, the share link stops working after this point in time.
    // null = no expiry (link is valid until explicitly revoked).
    shareExpiry: {
      type:    Date,
      default: null,
    },
    // ── Password-protected downloads ──────────────────────────────────────────
    // bcrypt hash of the download password.  null = no password required.
    // select: false so the hash is NEVER included in ordinary queries.
    downloadPassword: {
      type:    String,
      default: null,
      select:  false,
    },
    // Denormalised boolean so clients can check protection without exposing
    // the hash.
    isPasswordProtected: {
      type:    Boolean,
      default: false,
    },
    // ── Smart File Expiry ─────────────────────────────────────────────────────
    // When set, the cron job will delete this file and its disk data.
    expiryDate: {
      type:    Date,
      default: null,
    },
    // ── One-Time Download ─────────────────────────────────────────────────────
    // maxDownloads = 0 means unlimited.  Once currentDownloads >= maxDownloads
    // (and maxDownloads > 0) further downloads are blocked.
    maxDownloads: {
      type:    Number,
      default: 0,   // 0 = unlimited
      min:     0,
    },
    currentDownloads: {
      type:    Number,
      default: 0,
      min:     0,
    },
    // ── Version history ─────────────────────────────────────────────────────
    // Previous versions of this file. The latest version lives on the root
    // document; each time a new version is uploaded we snapshot the current
    // metadata into this array.
    versions: [
      {
        versionNumber: {
          type:    Number,
          required: true,
        },
        fileName:     String,
        originalName: String,
        fileSize:     Number,
        fileType:     String,
        fileUrl:      String,
        s3Key:        String,
        createdAt:    Date,
      },
    ],
    // ── AI metadata ─────────────────────────────────────────────────────────
    // High-level category used for smart organisation (e.g. image, document, notes)
    aiCategory: {
      type: String,
      enum: ['image', 'document', 'audio', 'video', 'code', 'notes', 'other'],
      default: 'other',
    },
    // Short AI-generated summary for documents
    summary: {
      type: String,
      default: null,
      trim: true,
    },
    // Important keywords or topics extracted from the file
    keywords: {
      type: [String],
      default: [],
    },
    // Human-friendly tags used for smart search / filters
    tags: {
      type: [String],
      default: [],
    },
    // SHA-256 hash of the binary content, used for duplicate detection
    contentHash: {
      type: String,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// Speed up queries that filter by owner + folder.
fileSchema.index({ uploadedBy: 1, folderId: 1, createdAt: -1 });
// Share-token lookups must be fast (public endpoint, no auth overhead).
fileSchema.index({ shareToken: 1 }, { sparse: true });
// Duplicate detection for a single user's library.
fileSchema.index({ uploadedBy: 1, contentHash: 1 });

module.exports = mongoose.model('File', fileSchema);
