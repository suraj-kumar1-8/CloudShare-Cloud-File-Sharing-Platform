const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const { protect }          = require('../middleware/auth');
const { getProfile, updateProfile, changePassword, uploadAvatar } = require('../controllers/profileController');

// ── Avatar multer config ──────────────────────────────────────────────────────
const avatarDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, avatarDir),
  filename:    (_, file, cb) => {
    const ext  = path.extname(file.originalname);
    cb(null, `avatar-${Date.now()}${ext}`);
  },
});
const avatarUpload = multer({
  storage: avatarStorage,
  limits:  { fileSize: 3 * 1024 * 1024 },          // 3 MB
  fileFilter: (_, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    cb(null, allowed.test(file.mimetype));
  },
});

const router = express.Router();
router.use(protect);

router.get('/',                getProfile);
router.patch('/',              updateProfile);
router.patch('/password',      changePassword);
router.post('/avatar', avatarUpload.single('avatar'), uploadAvatar);

module.exports = router;
