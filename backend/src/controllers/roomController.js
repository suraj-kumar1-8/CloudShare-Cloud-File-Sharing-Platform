const fs         = require('fs');
const path       = require('path');
const File       = require('../models/File');
const Room       = require('../models/Room');
const Submission = require('../models/Submission');
const { logActivity } = require('./activityController');

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// ── Helpers ────────────────────────────────────────────────────────────────────
const EXPIRY_HOURS = { '1h': 1, '24h': 24, '7d': 168, '30d': 720 };

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/rooms/create
 * Body: {
 *   roomName,
 *   expiresIn: '1h' | '24h' | '7d' | '30d',
 *   deadline?: ISO date string,
 *   allowLateSubmissions?: boolean
 * }
 */
const createRoom = async (req, res, next) => {
  try {
    const {
      roomName,
      expiresIn = '24h',
      deadline,
      allowLateSubmissions = false,
    } = req.body;

    if (!roomName?.trim()) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    const hours = EXPIRY_HOURS[expiresIn];
    if (!hours) {
      return res.status(400).json({ message: 'Invalid expiresIn. Use 1h, 24h, 7d or 30d' });
    }

    let deadlineDate = null;
    if (deadline) {
      const parsed = new Date(deadline);
      if (Number.isNaN(parsed.getTime())) {
        return res.status(400).json({ message: 'Invalid deadline date' });
      }
      deadlineDate = parsed;
    }

    const expiryTime = new Date(Date.now() + hours * 60 * 60 * 1000);
    const room = await Room.create({
      roomName:             roomName.trim(),
      createdBy:            req.user._id,
      expiryTime,
      deadline:             deadlineDate,
      allowLateSubmissions: !!allowLateSubmissions,
    });

    res.status(201).json({ message: 'Room created', room });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rooms/:roomId
 * Public — anyone with the room link can view the room contents.
 */
const getRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate('createdBy', 'name')
      .populate('files.uploadedBy', 'name email')
      .lean();

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (new Date() > new Date(room.expiryTime)) {
      return res.status(410).json({ message: 'This room has expired and its files have been deleted' });
    }

    res.json({ room });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/rooms
 * Returns all rooms created by the authenticated user.
 */
const listRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    const now = new Date();
    const annotated = rooms.map((r) => ({
      ...r,
      isExpired: now > new Date(r.expiryTime),
      fileCount: r.files?.length ?? 0,
    }));

    res.json({ rooms: annotated });
  } catch (error) {
    next(error);
  }
};
/**
 * POST /api/rooms/upload
 * Upload a file into a room. Multer runs before this handler.
 * Body (multipart): roomId (the short string ID), + file field.
 */
const uploadToRoom = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const room = await Room.findOne({ roomId: req.body.roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const now = new Date();

    if (now > new Date(room.expiryTime)) {
      return res.status(410).json({ message: 'Room has expired' });
    }

    if (room.deadline && now > new Date(room.deadline) && !room.allowLateSubmissions) {
      return res.status(410).json({ message: 'The deadline for this room has passed and uploads are blocked' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    // Persist the file metadata in the File collection so it has an _id
    const file = await File.create({
      fileName:     req.file.filename,
      originalName: req.file.originalname,
      fileSize:     req.file.size,
      fileType:     req.file.mimetype,
      fileUrl,
      s3Key:        req.file.filename,
      uploadedBy:   req.user._id,
    });

    // Embed a reference in the room document too (including who uploaded it)
    room.files.push({
      fileId:       file._id,
      originalName: file.originalName,
      fileSize:     file.fileSize,
      fileType:     file.fileType,
      fileUrl:      file.fileUrl,
      uploadedBy:   req.user._id,
    });
    await room.save();

    await logActivity('uploaded', file._id, req.user._id, { roomId: room.roomId });

    res.status(201).json({
      message: 'File uploaded to room',
      file: {
        fileId:       file._id,
        originalName: file.originalName,
        fileSize:     file.fileSize,
        fileType:     file.fileType,
        fileUrl:      file.fileUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/rooms/:roomId/submit
 * Public assignment submission endpoint.
 * Body (multipart): studentName, file
 */
const submitAssignment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const nameRaw = req.body.studentName || '';
    const studentName = nameRaw.trim();
    if (!studentName) {
      return res.status(400).json({ message: 'Student name is required' });
    }

    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const now = new Date();

    if (now > new Date(room.expiryTime)) {
      return res.status(410).json({ message: 'This room has expired and no longer accepts submissions' });
    }

    if (room.deadline && now > new Date(room.deadline) && !room.allowLateSubmissions) {
      return res.status(410).json({ message: 'The deadline for this room has passed and submissions are blocked' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    const submission = await Submission.create({
      studentName,
      room:      room._id,
      fileName:  req.file.originalname,
      fileUrl,
      uploadedAt: new Date(),
    });

    // Compute simple stats for this room (used both in HTTP response and real-time updates)
    const [totalSubmissions, distinctStudents] = await Promise.all([
      Submission.countDocuments({ room: room._id }),
      Submission.distinct('studentName', { room: room._id }),
    ]);

    const stats = {
      totalSubmissions,
      uniqueStudents: distinctStudents.length,
      latestSubmission: submission.uploadedAt,
    };

    // Emit real-time event if Socket.io is available
    const io = req.app.get('io');
    if (io) {
      io.to(room.roomId).emit('room:newSubmission', {
        submission,
        stats,
      });
    }

    return res.status(201).json({
      message: 'Assignment submitted successfully',
      submission,
      stats,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/rooms/:roomId/submissions
 * Teacher-only endpoint to list all submissions for a room.
 */
const listSubmissions = async (req, res, next) => {
  try {
    const room = await Room.findOne({
      roomId:    req.params.roomId,
      createdBy: req.user._id,
    }).lean();

    if (!room) {
      return res.status(404).json({ message: 'Room not found or not owned by you' });
    }

    const submissions = await Submission.find({ room: room._id })
      .sort({ uploadedAt: -1 })
      .lean();

    const totalSubmissions = submissions.length;
    const uniqueStudents   = new Set(submissions.map((s) => (s.studentName || '').trim().toLowerCase())).size;
    const latestSubmission = totalSubmissions > 0 ? submissions[0].uploadedAt : null;

    const stats = {
      totalSubmissions,
      uniqueStudents,
      latestSubmission,
    };

    return res.json({ submissions });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/rooms/:roomId
 * Only the room creator can delete it.
 */
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findOne({
      roomId:    req.params.roomId,
      createdBy: req.user._id,
    });

    if (!room) return res.status(404).json({ message: 'Room not found' });

    // Delete every file in this room from disk
    for (const entry of room.files) {
      const filePath = path.join(UPLOAD_DIR, entry.fileUrl?.split('/uploads/')[1] ?? '');
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (entry.fileId) await File.findByIdAndDelete(entry.fileId);
    }

    await room.deleteOne();
    res.json({ message: 'Room deleted' });
  } catch (error) {
    next(error);
  }
};
/**
 * DELETE /api/rooms/:roomId/submissions/:submissionId
 * Teacher-only: delete a single submission and its underlying file from disk.
 */
const deleteSubmission = async (req, res, next) => {
  try {
    const room = await Room.findOne({
      roomId:    req.params.roomId,
      createdBy: req.user._id,
    }).lean();

    if (!room) {
      return res.status(404).json({ message: 'Room not found or not owned by you' });
    }

    const submission = await Submission.findOne({
      _id:  req.params.submissionId,
      room: room._id,
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const relative = submission.fileUrl.split('/uploads/')[1];
    if (relative) {
      const filePath = path.join(UPLOAD_DIR, relative);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await submission.deleteOne();

    return res.json({ message: 'Submission deleted' });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createRoom,
  getRoom,
  listRooms,
  uploadToRoom,
  deleteRoom,
  submitAssignment,
  listSubmissions,
  deleteSubmission,
};
