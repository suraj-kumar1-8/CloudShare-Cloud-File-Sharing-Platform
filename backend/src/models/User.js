const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

/**
 * User schema.
 * Passwords are hashed with bcrypt before saving so plain-text
 * passwords are never persisted to the database.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
      minlength: [2,  'Name must be at least 2 characters'],
      maxlength: [50, 'Name must be at most 50 characters'],
    },
    email: {
      type:     String,
      required: [true, 'Email is required'],
      unique:   true,
      lowercase: true,
      trim:     true,
      match:    [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select:    false, // never return password in queries by default
    },
    // Total bytes stored by this user across all uploaded files.
    storageUsed: {
      type:    Number,
      default: 0,
      min:     0,
    },
    // URL to the user's avatar image (local path or S3 URL)
    avatarUrl: {
      type:    String,
      default: null,
    },
    // Password reset token (hashed for security)
    resetToken: {
      type: String,
      default: null,
    },
    // When the reset token expires
    resetTokenExpiry: {
      type: Date,
      default: null,
    },
    // Remember me token (for persistent login)
    rememberToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// ── Pre-save hook ─────────────────────────────────────────────────────────────
// Hash password only when it has been modified (new or updated).
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt   = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance method ───────────────────────────────────────────────────────────
// Compare a candidate password against the stored hash.
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate a password reset token
userSchema.methods.generateResetToken = function () {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  // Hash and store the token
  this.resetToken = crypto.createHash('sha256').update(token).digest('hex');
  // Set expiry to 30 minutes from now
  this.resetTokenExpiry = new Date(Date.now() + 30 * 60 * 1000);
  
  return token; // Return unhashed token to send to user
};

// Generate a remember me token
userSchema.methods.generateRememberToken = function () {
  const crypto = require('crypto');
  this.rememberToken = crypto.randomBytes(32).toString('hex');
  return this.rememberToken;
};

module.exports = mongoose.model('User', userSchema);
