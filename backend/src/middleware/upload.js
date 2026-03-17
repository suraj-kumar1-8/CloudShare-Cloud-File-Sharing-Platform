const multer = require('multer');
const path   = require('path');
const fs     = require('fs');
const { v4: uuidv4 } = require('uuid');

// ── Upload directory ──────────────────────────────────────────────────────────
// Files are stored locally inside backend/uploads/
// The folder is created automatically if it doesn't exist.
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// 50 MB upload limit
const MAX_SIZE = 50 * 1024 * 1024;

/**
 * Multer disk storage engine.
 * Each file is saved as <uuid><original-ext> inside the uploads/ directory
 * so names never collide even when different users upload the same filename.
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename:    (_req, file,  cb) => {
    const ext      = path.extname(file.originalname);
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    // Reject executables as a basic security measure
    const BLOCKED = ['.exe', '.sh', '.bat', '.cmd', '.ps1'];
    const ext     = path.extname(file.originalname).toLowerCase();
    if (BLOCKED.includes(ext)) {
      return cb(new Error('File type not allowed'), false);
    }
    cb(null, true);
  },
});

module.exports = upload;
