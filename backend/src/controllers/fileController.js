const fs          = require('fs');
const path        = require('path');
const crypto      = require('crypto');
const bcrypt      = require('bcryptjs');
const nodemailer  = require('nodemailer');
const File        = require('../models/File');
const User        = require('../models/User');
const { logActivity } = require('./activityController');
const { classifyFile, inferCategoryFromMime, summarizeFile, chatWithFile } = require('../services/aiService');

// Local uploads directory (mirrors middleware/upload.js)
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// ── Helpers ───────────────────────────────────────────────────────────────────
/**
 * Format bytes into a human-readable string (KB, MB, GB).
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k     = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i     = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/files/upload
 * multer disk storage runs before this handler and populates req.file.
 * We build a public URL and persist metadata to MongoDB.
 */
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    // Build an absolute URL pointing at our local static-file route
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    // Optional: place the file inside a folder (folderId sent in form body).
    // If omitted, we may route the file into a "smart" folder later.
    let folderId = req.body.folderId || null;

    // Optional automatic expiry for the file
    const expiryHours = parseInt(req.body.expiresIn, 10) || 0;
    const expiryDate  = expiryHours > 0
      ? new Date(Date.now() + expiryHours * 60 * 60 * 1000)
      : null;

    // Validate folderId belongs to this user if provided
    if (folderId) {
      const Folder = require('../models/Folder');
      const folder = await Folder.findOne({ _id: folderId, createdBy: req.user._id });
      if (!folder) return res.status(404).json({ message: 'Target folder not found' });
    }

    // Compute a SHA-256 hash of the content for duplicate detection and
    // as a stable key for future AI features.
    const filePath = path.join(UPLOAD_DIR, req.file.filename);
    const hash = crypto.createHash('sha256');
    const fileBuffer = fs.readFileSync(filePath);
    hash.update(fileBuffer);
    const contentHash = hash.digest('hex');

    // Determine a baseline AI category from the MIME type; an async AI call
    // may refine this later, but we don't block the upload on it.
    const aiCategory = inferCategoryFromMime(req.file.mimetype);

    const file = await File.create({
      fileName:     req.file.filename,
      originalName: req.file.originalname,
      fileSize:     req.file.size,
      fileType:     req.file.mimetype,
      fileUrl,
      s3Key:        req.file.filename,
      uploadedBy:   req.user._id,
      folderId:     folderId,
      expiryDate,
      contentHash,
      aiCategory,
    });

    // Update the user's total storage counter
    await User.findByIdAndUpdate(req.user._id, { $inc: { storageUsed: req.file.size } });
    await logActivity('uploaded', file._id, req.user._id);

    // Kick off best-effort AI classification, summarisation and
    // smart-folder routing without delaying the upload response.
    (async () => {
      try {
        // Ask AI to refine category and suggest tags based on basic context.
        const previewText = file.originalName || '';
        const { category, tags } = await classifyFile({
          originalName: file.originalName,
          mimeType:     file.fileType,
          previewText,
        });

        const Folder = require('../models/Folder');

        // Decide which smart folder (if any) this file should live in when
        // no explicit folderId was provided.
        let smartFolderId = folderId;
        if (!folderId) {
          let smartName = null;
          if (category === 'image') smartName   = 'Images';
          else if (category === 'document') smartName = 'Documents';
          else if (category === 'notes') smartName    = 'AI Notes';

          if (smartName) {
            const existing = await Folder.findOne({
              name:       smartName,
              parentFolder: null,
              createdBy:  req.user._id,
            });

            const folderDoc = existing || await Folder.create({
              name:       smartName,
              parentFolder: null,
              createdBy:  req.user._id,
            });
            smartFolderId = folderDoc._id;
          }
        }

        // Generate a short summary + keywords for document-like files.
        const { summary, keywords } = await summarizeFile({
          originalName: file.originalName,
          mimeType:     file.fileType,
          fileUrl:      file.fileUrl,
        });

        await File.findByIdAndUpdate(file._id, {
          aiCategory: category || aiCategory,
          tags,
          ...(summary ? { summary } : {}),
          ...(keywords && keywords.length ? { keywords } : {}),
          ...(smartFolderId && !folderId ? { folderId: smartFolderId } : {}),
        });
      } catch (err) {
        // Swallow AI errors so they never impact uploads.
      }
    })();

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id:           file._id,
        fileName:     file.fileName,
        originalName: file.originalName,
        fileSize:     file.fileSize,
        fileSizeHuman: formatBytes(file.fileSize),
        fileType:     file.fileType,
        fileUrl:      file.fileUrl,
        createdAt:    file.createdAt,
        expiryDate:   file.expiryDate,
        aiCategory:   file.aiCategory,
        tags:         file.tags,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/files
 * Return all files belonging to the authenticated user, newest first.
 */
const getFiles = async (req, res, next) => {
  try {
    // ?folderId=<id> → files inside a folder
    // ?folderId=root  → files at root level (folderId = null)
    // (no param)      → all files for the user
    let query = { uploadedBy: req.user._id };
    if (req.query.folderId === 'root') {
      query.folderId = null;
    } else if (req.query.folderId) {
      query.folderId = req.query.folderId;
    }

    const files = await File.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const formatted = files.map((f) => ({
      ...f,
      fileSizeHuman: formatBytes(f.fileSize),
      hasShareLink:  !!f.shareToken,
    }));

    res.json({ files: formatted, total: formatted.length });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/files/search?q=...
 * Semantic-ish search across the user's library using name, tags,
 * keywords and summary. Falls back to getFiles() shape.
 */
const searchFiles = async (req, res, next) => {
  try {
    const qRaw = (req.query.q || '').trim();
    if (!qRaw) {
      return getFiles(req, res, next);
    }

    const q = qRaw.toLowerCase();

    const base = { uploadedBy: req.user._id };

    const files = await File.find({
      ...base,
      $or: [
        { originalName: { $regex: q, $options: 'i' } },
        { fileName:     { $regex: q, $options: 'i' } },
        { tags:         { $elemMatch: { $regex: q, $options: 'i' } } },
        { keywords:     { $elemMatch: { $regex: q, $options: 'i' } } },
        { summary:      { $regex: q, $options: 'i' } },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = files.map((f) => ({
      ...f,
      fileSizeHuman: formatBytes(f.fileSize),
      hasShareLink:  !!f.shareToken,
    }));

    res.json({ files: formatted, total: formatted.length, query: qRaw });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/files/:id
 * Remove the file from disk and delete the metadata from MongoDB.
 */
const deleteFile = async (req, res, next) => {
  try {
    const file = await File.findOne({
      _id:        req.params.id,
      uploadedBy: req.user._id,   // ensure the file belongs to the caller
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // 1. Delete the physical file from disk (ignore error if already gone)
    const filePath = path.join(UPLOAD_DIR, file.s3Key);
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.warn(`Could not delete file from disk: ${err.message}`);
      }
    });

    // 2. Reduce the owner's storage counter (floor at 0 to guard against drift)
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { storageUsed: -file.fileSize },
    });
    await logActivity('deleted', file._id, req.user._id);

    // 3. Remove the metadata record from MongoDB
    await file.deleteOne();

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/files/download/:id
 * Stream the file from local disk to the client as an attachment.
 */
const downloadFile = async (req, res, next) => {
  try {
    const file = await File.findOne({
      _id:        req.params.id,
      uploadedBy: req.user._id,
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Enforce one-time / limited download cap
    if (file.maxDownloads > 0 && file.currentDownloads >= file.maxDownloads) {
      return res.status(403).json({ message: 'Download limit reached for this file' });
    }

    const filePath = path.join(UPLOAD_DIR, file.s3Key);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File no longer exists on disk' });
    }

    // Track how many times the file has been downloaded
    await File.findByIdAndUpdate(file._id, {
      $inc: { downloadCount: 1, currentDownloads: 1 },
      lastDownloadedAt: new Date(),
    });
    await logActivity('downloaded', file._id, req.user._id);

    // Return a direct URL so the frontend can open it in a new tab
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({ url: `${baseUrl}/uploads/${file.s3Key}` });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/files/:id/version
 * Upload a new version of an existing file.
 * The previous "current" version is snapshotted into file.versions.
 */
const uploadFileVersion = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const file = await File.findOne({
      _id:        req.params.id,
      uploadedBy: req.user._id,
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Snapshot current metadata as a previous version
    const existingVersions = file.versions || [];
    const nextVersionNumber = (existingVersions[existingVersions.length - 1]?.versionNumber || 0) + 1;

    existingVersions.push({
      versionNumber: nextVersionNumber,
      fileName:      file.fileName,
      originalName:  file.originalName,
      fileSize:      file.fileSize,
      fileType:      file.fileType,
      fileUrl:       file.fileUrl,
      s3Key:         file.s3Key,
      createdAt:     file.createdAt,
    });

    file.versions = existingVersions;

    // Build URL for the new file version
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    // Update file metadata to point at the new version
    const previousSize = file.fileSize || 0;
    file.fileName     = req.file.filename;
    file.originalName = req.file.originalname;
    file.fileSize     = req.file.size;
    file.fileType     = req.file.mimetype;
    file.fileUrl      = fileUrl;
    file.s3Key        = req.file.filename;

    await file.save();

    // Bump the user's storage counter by the size delta
    const sizeDelta = req.file.size - previousSize;
    if (sizeDelta !== 0) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { storageUsed: sizeDelta } });
    }

    await logActivity('version_uploaded', file._id, req.user._id, {
      previousVersionNumber: nextVersionNumber,
    });

    res.status(201).json({
      message: 'New file version uploaded successfully',
      file: {
        id:           file._id,
        fileName:     file.fileName,
        originalName: file.originalName,
        fileSize:     file.fileSize,
        fileSizeHuman: formatBytes(file.fileSize),
        fileType:     file.fileType,
        fileUrl:      file.fileUrl,
        createdAt:    file.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/files/:id/versions
 * List previous versions and the current logical version for a file.
 */
const getFileVersions = async (req, res, next) => {
  try {
    const file = await File.findOne({
      _id:        req.params.id,
      uploadedBy: req.user._id,
    }).lean();

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const versions = file.versions || [];
    const lastVersionNumber = versions[versions.length - 1]?.versionNumber || 0;
    const currentVersionNumber = lastVersionNumber + 1;

    const previousVersions = versions.map((v) => ({
      versionNumber: v.versionNumber,
      originalName:  v.originalName,
      fileSize:      v.fileSize,
      fileSizeHuman: formatBytes(v.fileSize || 0),
      fileType:      v.fileType,
      createdAt:     v.createdAt,
    })).sort((a, b) => b.versionNumber - a.versionNumber);

    const current = {
      versionNumber: currentVersionNumber,
      originalName:  file.originalName,
      fileSize:      file.fileSize,
      fileSizeHuman: formatBytes(file.fileSize || 0),
      fileType:      file.fileType,
      createdAt:     file.createdAt,
      isCurrent:     true,
    };

    res.json({ fileId: file._id, current, versions: previousVersions });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/files/:id/versions/:versionNumber
 * Get a direct download URL for a specific historical version.
 */
const downloadFileVersion = async (req, res, next) => {
  try {
    const versionNumber = parseInt(req.params.versionNumber, 10);
    if (Number.isNaN(versionNumber) || versionNumber <= 0) {
      return res.status(400).json({ message: 'Invalid version number' });
    }

    const file = await File.findOne({
      _id:        req.params.id,
      uploadedBy: req.user._id,
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Enforce download caps on the parent file
    if (file.maxDownloads > 0 && file.currentDownloads >= file.maxDownloads) {
      return res.status(403).json({ message: 'Download limit reached for this file' });
    }

    const versions = file.versions || [];
    const lastVersionNumber = versions[versions.length - 1]?.versionNumber || 0;
    const currentVersionNumber = lastVersionNumber + 1;

    let targetKey;
    if (versionNumber === currentVersionNumber) {
      targetKey = file.s3Key;
    } else {
      const match = versions.find((v) => v.versionNumber === versionNumber);
      if (!match) {
        return res.status(404).json({ message: 'Version not found' });
      }
      targetKey = match.s3Key;
    }

    const filePath = path.join(UPLOAD_DIR, targetKey);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File version no longer exists on disk' });
    }

    await File.findByIdAndUpdate(file._id, {
      $inc: { downloadCount: 1, currentDownloads: 1 },
      lastDownloadedAt: new Date(),
    });
    await logActivity('downloaded_version', file._id, req.user._id, { versionNumber });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({ url: `${baseUrl}/uploads/${targetKey}` });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/files/:id/share
 * Generate (or refresh) a share token for a file and set an expiry.
 * Body: { expiresIn: 1 | 24 | 168 }  — hours.  Omit / 0 for no expiry.
 * Protected — only the file owner can create a share link.
 */
const createShareLink = async (req, res, next) => {
  try {
    const file = await File.findOne({
      _id:        req.params.id,
      uploadedBy: req.user._id,
    });

    if (!file) return res.status(404).json({ message: 'File not found' });

    // Generate a cryptographically-random 48-byte token → 96 hex chars
    const token = crypto.randomBytes(48).toString('hex');

    // Calculate expiry date (or null if no expiry requested)
    const hours = parseInt(req.body.expiresIn, 10);
    let shareExpiry = null;
    if (hours && hours > 0) {
      shareExpiry = new Date(Date.now() + hours * 60 * 60 * 1000);
    }

    // Optional download password — hash before storing
    const rawPassword = req.body.password ? String(req.body.password).trim() : null;
    if (rawPassword) {
      if (rawPassword.length < 4) {
        return res.status(400).json({ message: 'Password must be at least 4 characters' });
      }
      file.downloadPassword    = await bcrypt.hash(rawPassword, 10);
      file.isPasswordProtected = true;
    } else {
      // Regenerating without a password clears any previous one
      file.downloadPassword    = null;
      file.isPasswordProtected = false;
    }

    file.shareToken  = token;
    file.shareExpiry = shareExpiry;
    await file.save();
    await logActivity('shared', file._id, req.user._id, { expiresIn: hours || null, isPasswordProtected: file.isPasswordProtected });

    // The share URL points to the FRONTEND page — it handles password collection
    // before calling the POST /api/files/share/:token endpoint.
    // We return the token so the frontend can build the URL with its own origin.
    res.json({
      token,
      shareExpiry,
      expiresIn:           hours || null,
      isPasswordProtected: file.isPasswordProtected,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/files/:id/share
 * Revoke an active share link — clears token + expiry.
 * Protected — only the file owner can revoke.
 */
const revokeShareLink = async (req, res, next) => {
  try {
    const file = await File.findOne({
      _id:        req.params.id,
      uploadedBy: req.user._id,
    });

    if (!file) return res.status(404).json({ message: 'File not found' });

    file.shareToken          = null;
    file.shareExpiry         = null;
    file.downloadPassword    = null;
    file.isPasswordProtected = false;
    await file.save();
    await logActivity('share_revoked', file._id, req.user._id);

    res.json({ message: 'Share link revoked' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/files/share/:token/info
 * Public — returns file metadata and whether a password is required.
 * Does NOT reveal the file URL or hash.
 */
const getShareInfo = async (req, res, next) => {
  try {
    const file = await File.findOne({ shareToken: req.params.token });

    if (!file) {
      return res.status(404).json({ message: 'Share link not found or already revoked' });
    }

    if (file.shareExpiry && new Date() > file.shareExpiry) {
      return res.status(410).json({
        message: 'This share link has expired',
        expiredAt: file.shareExpiry,
      });
    }

    res.json({
      originalName:        file.originalName,
      fileType:            file.fileType,
      fileSize:            file.fileSize,
      fileSizeHuman:       formatBytes(file.fileSize),
      shareExpiry:         file.shareExpiry,
      isPasswordProtected: file.isPasswordProtected,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/files/share/:token
 * Public — verifies optional password then returns the direct download URL.
 */
const downloadSharedFile = async (req, res, next) => {
  try {
    // Explicitly select downloadPassword (excluded by default)
    const file = await File.findOne({ shareToken: req.params.token }).select('+downloadPassword');

    if (!file) {
      return res.status(404).json({ message: 'Share link not found or already revoked' });
    }

    if (file.shareExpiry && new Date() > file.shareExpiry) {
      return res.status(410).json({
        message: 'This share link has expired',
        expiredAt: file.shareExpiry,
      });
    }

    // ── Password verification ─────────────────────────────────────────────────
    if (file.isPasswordProtected) {
      const { password } = req.body;
      if (!password) {
        return res.status(401).json({ message: 'Password required', requiresPassword: true });
      }
      const valid = await bcrypt.compare(String(password), file.downloadPassword);
      if (!valid) {
        return res.status(401).json({ message: 'Incorrect password' });
      }
    }

    // ── Download-limit enforcement ─────────────────────────────────────────
    if (file.maxDownloads > 0 && file.currentDownloads >= file.maxDownloads) {
      return res.status(403).json({ message: 'This link has already been used and is no longer valid' });
    }

    // ── Deliver the file ──────────────────────────────────────────────────────
    const filePath = path.join(UPLOAD_DIR, file.s3Key);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File no longer exists on the server' });
    }

    await File.findByIdAndUpdate(file._id, {
      $inc: { downloadCount: 1, currentDownloads: 1 },
      lastDownloadedAt: new Date(),
    });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({
      url:          `${baseUrl}/uploads/${file.s3Key}`,
      originalName: file.originalName,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/files/share/:token
 * Legacy public redirect — kept for backward compatibility with non-password links.
 * Password-protected links respond with 401 so the frontend page handles them.
 */
const accessSharedFile = async (req, res, next) => {
  try {
    const file = await File.findOne({ shareToken: req.params.token });

    if (!file) {
      return res.status(404).json({ message: 'Share link not found or already revoked' });
    }

    if (file.shareExpiry && new Date() > file.shareExpiry) {
      return res.status(410).json({
        message: 'This share link has expired',
        expiredAt: file.shareExpiry,
      });
    }

    // Password-protected — must use the POST endpoint (or the frontend page)
    if (file.isPasswordProtected) {
      return res.status(401).json({ message: 'Password required', requiresPassword: true });
    }

    const filePath = path.join(UPLOAD_DIR, file.s3Key);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File no longer exists on the server' });
    }

    await File.findByIdAndUpdate(file._id, {
      $inc: { downloadCount: 1 },
      lastDownloadedAt: new Date(),
    });

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.redirect(`${baseUrl}/uploads/${file.s3Key}`);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/files/share-email
 * Send a share link to a recipient email using nodemailer.
 * Body: { fileId, recipientEmail, expiresIn, message (optional) }
 * Protected — only the file owner can send the email.
 */
const shareByEmail = async (req, res, next) => {
  try {
    const { fileId, recipientEmail, expiresIn, message } = req.body;

    if (!fileId || !recipientEmail) {
      return res.status(400).json({ message: 'fileId and recipientEmail are required' });
    }
    if (!/^\S+@\S+\.\S+$/.test(recipientEmail)) {
      return res.status(400).json({ message: 'Invalid recipient email address' });
    }

    const file = await File.findOne({ _id: fileId, uploadedBy: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Create a fresh share link if none active, otherwise reuse existing token
    let token = file.shareToken;
    if (!token) {
      token = crypto.randomBytes(48).toString('hex');
      const hours = parseInt(expiresIn, 10);
      const shareExpiry = hours && hours > 0
        ? new Date(Date.now() + hours * 60 * 60 * 1000)
        : null;
      file.shareToken  = token;
      file.shareExpiry = shareExpiry;
      await file.save();
    }

    // Build the share URL (CLIENT_URL in production, request origin in dev)
    const clientOrigin = process.env.CLIENT_URL ||
      `${req.protocol}://${req.get('host').replace('5001', '5174')}`;
    const shareUrl = `${clientOrigin}/share/${token}`;

    // ── Nodemailer transport ───────────────────────────────────────────────
    // In dev, falls back to Ethereal (auto-generated test account) if no SMTP
    // env vars are configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
    // in .env for a real provider.
    let transporter;
    if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host:   process.env.SMTP_HOST,
        port:   parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Ethereal test account (messages visible at https://ethereal.email)
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host:   'smtp.ethereal.email',
        port:   587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });
    }

    const senderName  = req.user.name || 'Someone';
    const expiryNote  = file.shareExpiry
      ? `This link expires on ${new Date(file.shareExpiry).toLocaleString()}.`
      : 'This link does not expire.';

    const info = await transporter.sendMail({
      from:    `"${senderName} via CloudDrive" <noreply@clouddrive.app>`,
      to:      recipientEmail,
      subject: `${senderName} shared a file with you: ${file.originalName}`,
      text: [
        `Hi,`,
        ``,
        `${senderName} has shared a file with you: ${file.originalName}`,
        message ? `\nMessage: ${message}\n` : '',
        `Download here: ${shareUrl}`,
        ``,
        expiryNote,
      ].join('\n'),
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto">
          <h2 style="color:#2563eb">📁 ${file.originalName}</h2>
          <p><strong>${senderName}</strong> has shared a file with you.</p>
          ${message ? `<blockquote style="border-left:3px solid #e5e7eb;padding:8px 16px;color:#6b7280">${message}</blockquote>` : ''}
          <a href="${shareUrl}"
             style="display:inline-block;margin-top:16px;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">
            Download file
          </a>
          <p style="margin-top:16px;font-size:13px;color:#9ca3af">${expiryNote}</p>
        </div>
      `,
    });

    // In development log the Ethereal preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl && process.env.NODE_ENV !== 'production') {
      console.log('📧  Email preview (Ethereal):', previewUrl);
    }

    res.json({
      message: 'Email sent successfully',
      shareUrl,
      ...(previewUrl ? { previewUrl } : {}),
    });
    await logActivity('share_emailed', file._id, req.user._id, { recipientEmail });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/files/expiry/:id
 * Set (or clear) an automatic expiry date for a file.
 * Body: { expiresIn: 1 | 24 | 168 | 720 }  hours.  0 = remove expiry.
 */
const setFileExpiry = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.id, uploadedBy: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    const hours = parseInt(req.body.expiresIn, 10);
    file.expiryDate = hours > 0
      ? new Date(Date.now() + hours * 60 * 60 * 1000)
      : null;
    await file.save();

    res.json({ message: 'File expiry updated', expiryDate: file.expiryDate });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/files/share-once/:id
 * Generate a single-use share link for a file.
 * After the link is downloaded once, it becomes invalid.
 * Body: { expiresIn }  – optional hours until link also time-expires.
 */
const shareOnce = async (req, res, next) => {
  try {
    const file = await File.findOne({ _id: req.params.id, uploadedBy: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    const token = crypto.randomBytes(48).toString('hex');
    const hours = parseInt(req.body.expiresIn, 10);
    const shareExpiry = hours > 0
      ? new Date(Date.now() + hours * 60 * 60 * 1000)
      : null;

    file.shareToken       = token;
    file.shareExpiry      = shareExpiry;
    file.maxDownloads     = 1;
    file.currentDownloads = 0;
    file.isPasswordProtected = false;
    file.downloadPassword    = null;
    await file.save();

    await logActivity('shared', file._id, req.user._id, { once: true });

    res.json({ token, shareExpiry });
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/files/:id/rename ───────────────────────────────────────────────
const renameFile = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'New name is required' });

    const file = await File.findOne({ _id: req.params.id, uploadedBy: req.user._id });
    if (!file) return res.status(404).json({ message: 'File not found' });

    file.originalName = name.trim();
    await file.save();
    await logActivity('renamed', file._id, req.user._id, { newName: name.trim() });
    res.json({ file });
  } catch (error) { next(error); }
};

/**
 * GET /api/files/:id/summary
 * Return (and lazily generate) the AI summary + keywords for a file.
 *
 * If the file already has a summary cached, we return it immediately.
 * Otherwise we call the AI service, persist the result, and return it.
 */
const getFileSummary = async (req, res, next) => {
  try {
    const file = await File.findOne({
      _id:        req.params.id,
      uploadedBy: req.user._id,
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // If we already have a summary + keywords cached and no refresh is
    // requested, just return them.
    const hasCachedSummary = !!file.summary || (Array.isArray(file.keywords) && file.keywords.length > 0);
    const forceRefresh = String(req.query.refresh || '') === 'true';

    if (hasCachedSummary && !forceRefresh) {
      return res.json({
        summary:  file.summary || null,
        keywords: Array.isArray(file.keywords) ? file.keywords : [],
        cached:   true,
      });
    }

    // Best-effort AI call — if AI isn't configured or fails, we return
    // a null summary so the frontend can show a friendly message.
    const { summary, keywords } = await summarizeFile({
      originalName: file.originalName,
      mimeType:     file.fileType,
      fileUrl:      file.fileUrl,
    });

    if (summary || (keywords && keywords.length)) {
      file.summary  = summary || file.summary;
      file.keywords = Array.isArray(keywords) && keywords.length ? keywords : file.keywords;
      await file.save();
    }

    res.json({
      summary:  summary || file.summary || null,
      keywords: Array.isArray(file.keywords) ? file.keywords : [],
      cached:   false,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/files/:id/chat
 * Body: { question: string, history?: [{ role, content }] }
 * Returns { answer } from the AI service.
 */
const chatAboutFile = async (req, res, next) => {
  try {
    const { question, history } = req.body || {};
    if (!question || !String(question).trim()) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const file = await File.findOne({
      _id:        req.params.id,
      uploadedBy: req.user._id,
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const { answer } = await chatWithFile({
      originalName: file.originalName,
      mimeType:     file.fileType,
      fileUrl:      file.fileUrl,
      question:     String(question).trim(),
      history:      Array.isArray(history) ? history : [],
    });

    if (!answer) {
      return res.json({
        answer: 'AI chat is not configured in this environment. Set AI_API_URL and AI_API_KEY in the backend .env to enable it.',
      });
    }

    res.json({ answer });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile, getFiles, deleteFile, downloadFile,
  uploadFileVersion, getFileVersions, downloadFileVersion,
  createShareLink, revokeShareLink,
  getShareInfo, downloadSharedFile, accessSharedFile,
  shareByEmail,
  setFileExpiry, shareOnce,
  renameFile,
  getFileSummary,
    chatAboutFile,
   searchFiles,
};
