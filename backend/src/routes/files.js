const express = require('express');
const {
  uploadFile, getFiles, deleteFile, downloadFile,
  uploadFileVersion, getFileVersions, downloadFileVersion,
  createShareLink, revokeShareLink,
  getShareInfo, downloadSharedFile, accessSharedFile,
  shareByEmail, setFileExpiry, shareOnce, renameFile,
  getFileSummary, chatAboutFile, searchFiles,
} = require('../controllers/fileController');
const { importFolder, importZip } = require('../controllers/importController');
const { getFileActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');
const upload      = require('../middleware/upload');

const router = express.Router();

// ── Public routes (no JWT required) ──────────────────────────────────────────
// IMPORTANT: more-specific paths must come before /:token
// Returns file metadata + whether a password is required (no hash exposed)
router.get('/share/:token/info', getShareInfo);
// Submit password (or empty) and receive the download URL
router.post('/share/:token', downloadSharedFile);
// Legacy redirect for non-password-protected links
router.get('/share/:token', accessSharedFile);

// ── All routes below require a valid JWT ─────────────────────────────────────
router.use(protect);

// Upload a single file
router.post('/upload', upload.single('file'), uploadFile);

// Bulk imports
router.post('/import/folder', upload.array('files'), importFolder);
router.post('/import/zip',    upload.array('files'), importZip);

// Upload a new version of an existing file
router.post('/:id/version', upload.single('file'), uploadFileVersion);

// Search files (name, tags, keywords, summary)
router.get('/search', searchFiles);

// List all files belonging to the authenticated user
router.get('/', getFiles);

// Delete a file by MongoDB id
router.delete('/:id', deleteFile);

// Generate a download URL (owner only, no password required)
router.get('/download/:id', downloadFile);

// Version history + specific-version downloads
router.get('/:id/versions', getFileVersions);
router.get('/:id/versions/:versionNumber', downloadFileVersion);

// AI chat about a specific file (owner only)
router.post('/:id/chat', chatAboutFile);

// Share-link management (owner only)
router.post('/:id/share', createShareLink);
router.delete('/:id/share', revokeShareLink);

// One-time download link (owner only)
router.post('/share-once/:id', shareOnce);

// Email sharing (owner only)
router.post('/share-email', shareByEmail);

// Smart file expiry (owner only)
router.post('/expiry/:id', setFileExpiry);

// File activity timeline (owner only)
router.get('/activity/:fileId', getFileActivity);

// Rename a file (owner only)
router.patch('/:id/rename', renameFile);

// AI-generated document summary + keywords (owner only)
router.get('/:id/summary', getFileSummary);

module.exports = router;
