const Folder = require('../models/Folder');
const File   = require('../models/File');

// ─────────────────────────────────────────────────────────────────────────────
// Helper – recursively collect all descendant folder ids of a given folder.
// Used so we can bulk-delete all nested content when a folder is removed.
// ─────────────────────────────────────────────────────────────────────────────
async function collectDescendantIds(folderId) {
  const children = await Folder.find({ parentFolder: folderId }).select('_id');
  let ids = children.map((c) => c._id);
  for (const child of children) {
    const nested = await collectDescendantIds(child._id);
    ids = ids.concat(nested);
  }
  return ids;
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/folders/create
 * Create a new folder, optionally nested inside a parent folder.
 */
const createFolder = async (req, res, next) => {
  try {
    const { name, parentFolder = null } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    // If a parentFolder id was supplied, make sure it exists and belongs to the user
    if (parentFolder) {
      const parent = await Folder.findOne({ _id: parentFolder, createdBy: req.user._id });
      if (!parent) {
        return res.status(404).json({ message: 'Parent folder not found' });
      }
    }

    const folder = await Folder.create({
      name:         name.trim(),
      parentFolder: parentFolder || null,
      createdBy:    req.user._id,
    });

    res.status(201).json({ message: 'Folder created', folder });
  } catch (error) {
    // Duplicate name in same parent → friendly message
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A folder with that name already exists here' });
    }
    next(error);
  }
};

/**
 * GET /api/folders
 * List root-level folders (parentFolder = null) for the authenticated user.
 * Pass ?parentFolder=<id> to list children of a specific folder.
 */
const getFolders = async (req, res, next) => {
  try {
    const parentFolder = req.query.parentFolder || null;

    const folders = await Folder.find({
      createdBy:    req.user._id,
      parentFolder: parentFolder,
    })
      .sort({ name: 1 })
      .lean();

    // Attach child/file counts so the UI can show meaningful badges
    const enriched = await Promise.all(
      folders.map(async (f) => {
        const [childCount, fileCount] = await Promise.all([
          Folder.countDocuments({ parentFolder: f._id, createdBy: req.user._id }),
          File.countDocuments({   folderId: f._id,     uploadedBy: req.user._id }),
        ]);
        return { ...f, childCount, fileCount };
      })
    );

    res.json({ folders: enriched, total: enriched.length });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/folders/:id
 * Get a single folder plus its direct children and the files inside it.
 * Also returns breadcrumb path from root to this folder.
 */
const getFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findOne({
      _id:       req.params.id,
      createdBy: req.user._id,
    }).lean();

    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    // Build breadcrumb (root → … → current)
    const breadcrumb = [];
    let current = folder;
    while (current.parentFolder) {
      // eslint-disable-next-line no-await-in-loop
      const parent = await Folder.findById(current.parentFolder).lean();
      if (!parent) break;
      breadcrumb.unshift({ _id: parent._id, name: parent.name });
      current = parent;
    }
    breadcrumb.push({ _id: folder._id, name: folder.name }); // append self

    // Direct child folders
    const children = await Folder.find({
      parentFolder: folder._id,
      createdBy:    req.user._id,
    })
      .sort({ name: 1 })
      .lean();

    // Files directly inside this folder
    const files = await File.find({
      folderId:   folder._id,
      uploadedBy: req.user._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ folder, breadcrumb, children, files });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/folders/:id
 * Deletes the folder AND all nested sub-folders and their files (cascade).
 */
const deleteFolder = async (req, res, next) => {
  try {
    const folder = await Folder.findOne({
      _id:       req.params.id,
      createdBy: req.user._id,
    });

    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    // Collect ALL descendant folder ids (recursive)
    const descendantIds = await collectDescendantIds(folder._id);
    const allFolderIds  = [folder._id, ...descendantIds];

    // Delete files that live in any of these folders (we do NOT delete them
    // from disk here – a separate cleanup job can handle orphaned files,
    // or you can add disk deletion logic similar to fileController.deleteFile)
    await File.deleteMany({ folderId: { $in: allFolderIds }, uploadedBy: req.user._id });

    // Delete all folders (descendant + self)
    await Folder.deleteMany({ _id: { $in: allFolderIds } });

    res.json({ message: 'Folder and all its contents deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/folders/:id/rename
 * Rename a folder.
 */
const renameFolder = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'New name is required' });
    }

    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    res.json({ message: 'Folder renamed', folder });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A folder with that name already exists here' });
    }
    next(error);
  }
};

module.exports = { createFolder, getFolders, getFolder, deleteFolder, renameFolder };
