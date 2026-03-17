const express        = require('express');
const { getStorage } = require('../controllers/userController');
const { protect }    = require('../middleware/auth');

const router = express.Router();

// All user routes require a valid JWT
router.use(protect);

// GET /api/user/storage
router.get('/storage', getStorage);

module.exports = router;
