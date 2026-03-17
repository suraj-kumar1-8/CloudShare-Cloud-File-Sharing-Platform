const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getNotifications, markAllRead, markRead, clearAll,
} = require('../controllers/notificationController');

const router = express.Router();
router.use(protect);

router.get('/',              getNotifications);
router.patch('/read-all',    markAllRead);
router.patch('/:id/read',    markRead);
router.delete('/',           clearAll);

module.exports = router;
