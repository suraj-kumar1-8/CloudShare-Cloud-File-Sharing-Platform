const express = require('express');
const {
  createFolder,
  getFolders,
  getFolder,
  deleteFolder,
  renameFolder,
} = require('../controllers/folderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All folder routes require authentication
router.use(protect);

router.post  ('/create',       createFolder);   // POST   /api/folders/create
router.get   ('/',             getFolders);     // GET    /api/folders[?parentFolder=<id>]
router.get   ('/:id',          getFolder);      // GET    /api/folders/:id
router.delete('/:id',          deleteFolder);   // DELETE /api/folders/:id
router.patch ('/:id/rename',   renameFolder);   // PATCH  /api/folders/:id/rename

module.exports = router;
