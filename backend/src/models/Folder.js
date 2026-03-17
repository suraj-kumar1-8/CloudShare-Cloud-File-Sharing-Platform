const mongoose = require('mongoose');

/**
 * Folder schema.
 * Supports unlimited nesting via the parentFolder self-reference.
 * A null parentFolder means the folder lives at the root level.
 */
const folderSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Folder name is required'],
      trim:      true,
      minlength: [1,  'Name cannot be empty'],
      maxlength: [100, 'Name must be at most 100 characters'],
    },
    // Self-reference for nesting.  null = root-level folder.
    parentFolder: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'Folder',
      default: null,
    },
    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'createdBy is required'],
    },
  },
  { timestamps: true }
);

// ── Compound unique index ─────────────────────────────────────────────────────
// A user cannot have two folders with the same name inside the same parent.
folderSchema.index(
  { name: 1, parentFolder: 1, createdBy: 1 },
  { unique: true }
);

// Speed-up: listing children of a folder or all root folders for a user.
folderSchema.index({ createdBy: 1, parentFolder: 1 });

module.exports = mongoose.model('Folder', folderSchema);
