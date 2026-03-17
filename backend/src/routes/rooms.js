const express    = require('express');
const {
  createRoom,
  getRoom,
  listRooms,
  uploadToRoom,
  deleteRoom,
  submitAssignment,
  listSubmissions,
  deleteSubmission,
} = require('../controllers/roomController');
const { protect } = require('../middleware/auth');
const upload      = require('../middleware/upload');

const router = express.Router();

// Public — anyone with the roomId can view (read-only)
router.get('/:roomId', getRoom);

// Public assignment submission endpoint (no auth required)
router.post('/:roomId/submit', upload.single('file'), submitAssignment);

// All write operations require auth
router.use(protect);

router.post('/create',        createRoom);
router.get('/',               listRooms);
router.post('/upload',        upload.single('file'), uploadToRoom);
router.get('/:roomId/submissions',       listSubmissions);
router.delete('/:roomId/submissions/:submissionId', deleteSubmission);
router.delete('/:roomId',     deleteRoom);

module.exports = router;
