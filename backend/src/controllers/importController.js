const fs       = require('fs');
const path     = require('path');
const crypto   = require('crypto');
const AdmZip   = require('adm-zip');
const File     = require('../models/File');
const Folder   = require('../models/Folder');
const User     = require('../models/User');
const { logActivity } = require('./activityController');

// Local uploads directory (mirrors middleware/upload.js)
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Helper to format bytes
const formatBytes = (bytes = 0) => {
  if (!bytes || bytes === 0) return '0 B';
  const k     = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i     = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

// In-memory cache helper for folders within a single request
async function getOrCreateFolder({ userId, name, parentId, cache }) {
  const cacheKey = `${parentId || 'root'}:${name}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  let folder = await Folder.findOne({ name, parentFolder: parentId || null, createdBy: userId });
  if (!folder) {
    folder = await Folder.create({
      name,
      parentFolder: parentId || null,
      createdBy: userId,
    });
  }
  cache.set(cacheKey, folder);
  return folder;
}

/**
 * POST /api/files/import/folder
 * multer array('files') populates req.files; client also sends paths[] with
 * each file's relative path (e.g. "Assignments/file1.pdf").
 * We recreate the folder hierarchy in MongoDB and place files accordingly.
 */
const importFolder = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files provided for folder import' });
    }

    const userId = req.user._id;
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    let paths = req.body.paths || [];
    if (!Array.isArray(paths)) paths = [paths];

    if (!paths.length || paths.length !== req.files.length) {
      return res.status(400).json({ message: 'paths count must match files count' });
    }

    const cache = new Map();
    const createdFiles = [];
    let rootFolder = null;

    for (let i = 0; i < req.files.length; i += 1) {
      const file = req.files[i];
      const relPath = paths[i] || file.originalname;
      const segments = relPath.split('/').filter(Boolean);
      if (segments.length === 0) continue;

      const folderSegments = segments.slice(0, -1); // all but file name
      const fileNameFromPath = segments[segments.length - 1];

      let parentId = null;
      for (const segment of folderSegments) {
        const folder = await getOrCreateFolder({ userId, name: segment, parentId, cache });
        parentId = folder._id;
        if (!rootFolder) rootFolder = folder;
      }

      const fileUrl = `${baseUrl}/uploads/${file.filename}`;
      const fileDoc = await File.create({
        fileName:     file.filename,
        originalName: fileNameFromPath || file.originalname,
        fileSize:     file.size,
        fileType:     file.mimetype,
        fileUrl,
        s3Key:        file.filename,
        uploadedBy:   userId,
        folderId:     parentId || null,
      });

      await User.findByIdAndUpdate(userId, { $inc: { storageUsed: file.size } });
      await logActivity('uploaded', fileDoc._id, userId);

      createdFiles.push({
        id:            fileDoc._id,
        fileName:      fileDoc.fileName,
        originalName:  fileDoc.originalName,
        fileSize:      fileDoc.fileSize,
        fileSizeHuman: formatBytes(fileDoc.fileSize),
        fileType:      fileDoc.fileType,
        fileUrl:       fileDoc.fileUrl,
        folderId:      fileDoc.folderId,
        createdAt:     fileDoc.createdAt,
      });
    }

    return res.status(201).json({
      message: 'Folder imported successfully',
      rootFolder,
      files: createdFiles,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/files/import/zip
 * Accepts one or more ZIP files (field name: files). Each ZIP is extracted and
 * its contents are stored inside a new folder named after the ZIP filename.
 */
const importZip = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No ZIP files provided' });
    }

    const userId = req.user._id;
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const cache = new Map();
    const allFiles = [];
    const rootFolders = [];

    for (const zipUpload of req.files) {
      const zipPath = path.join(UPLOAD_DIR, zipUpload.filename);
      const zipNameBase = path.basename(zipUpload.originalname, path.extname(zipUpload.originalname));

      const zip = new AdmZip(zipPath);
      const entries = zip.getEntries();

      let rootFolder = null;

      // Iterate over every file inside the ZIP (ignore directories)
      // eslint-disable-next-line no-restricted-syntax
      for (const entry of entries) {
        if (entry.isDirectory) continue;

        const entryPath = entry.entryName; // e.g. "folder/file1.pdf"
        const segments = entryPath.split('/').filter(Boolean);
        if (segments.length === 0) continue;

        const fileNameFromPath = segments[segments.length - 1];
        const folderSegments = [zipNameBase, ...segments.slice(0, -1)];

        let parentId = null;
        for (const segment of folderSegments) {
          const folder = await getOrCreateFolder({ userId, name: segment, parentId, cache });
          parentId = folder._id;
          if (!rootFolder) rootFolder = folder;
        }

        const uniqueName = `${crypto.randomBytes(16).toString('hex')}${path.extname(fileNameFromPath)}`;
        const outPath = path.join(UPLOAD_DIR, uniqueName);
        const dataBuffer = entry.getData();
        fs.writeFileSync(outPath, dataBuffer);

        const fileUrl = `${baseUrl}/uploads/${uniqueName}`;

        // Best-effort MIME detection based on extension for common types
        const ext = path.extname(fileNameFromPath).toLowerCase();
        let mimeType = 'application/octet-stream';
        if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
        else if (ext === '.png') mimeType = 'image/png';
        else if (ext === '.gif') mimeType = 'image/gif';
        else if (ext === '.pdf') mimeType = 'application/pdf';
        else if (ext === '.doc') mimeType = 'application/msword';
        else if (ext === '.docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        else if (ext === '.zip') mimeType = 'application/zip';
        else if (ext === '.mp4') mimeType = 'video/mp4';

        const fileDoc = await File.create({
          fileName:     uniqueName,
          originalName: fileNameFromPath,
          fileSize:     dataBuffer.length,
          fileType:     mimeType,
          fileUrl,
          s3Key:        uniqueName,
          uploadedBy:   userId,
          folderId:     parentId || null,
        });

        await User.findByIdAndUpdate(userId, { $inc: { storageUsed: dataBuffer.length } });
        await logActivity('uploaded', fileDoc._id, userId);

        allFiles.push({
          id:            fileDoc._id,
          fileName:      fileDoc.fileName,
          originalName:  fileDoc.originalName,
          fileSize:      fileDoc.fileSize,
          fileSizeHuman: formatBytes(fileDoc.fileSize),
          fileType:      fileDoc.fileType,
          fileUrl:       fileDoc.fileUrl,
          folderId:      fileDoc.folderId,
          createdAt:     fileDoc.createdAt,
        });
      }

      if (rootFolder) rootFolders.push(rootFolder);

      // Best-effort: delete the original ZIP from disk
      fs.unlink(zipPath, () => {});
    }

    return res.status(201).json({
      message: 'ZIP archive(s) imported successfully',
      rootFolders,
      files: allFiles,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { importFolder, importZip };
