require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const morgan       = require('morgan');
const path         = require('path');
const fs           = require('fs');
const http         = require('http');
const { Server }   = require('socket.io');
const connectDB    = require('./config/db');
const authRoutes   = require('./routes/auth');
const fileRoutes   = require('./routes/files');
const folderRoutes = require('./routes/folders');
const userRoutes   = require('./routes/user');
const roomRoutes         = require('./routes/rooms');
const profileRoutes      = require('./routes/profile');
const notificationRoutes = require('./routes/notifications');
const dashboardRoutes    = require('./routes/dashboard');
const errorHandler       = require('./middleware/errorHandler');
const { startFileExpiryJob, startRoomExpiryJob } = require('./jobs/cleanup');

// Ensure uploads directory exists on startup
const UPLOAD_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── Bootstrap ─────────────────────────────────────────────────────────────────
connectDB();

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 5000;

// ── Core Middleware ───────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    // In development accept any localhost port (Vite can pick 5173, 5174, …)
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    // In production only accept the configured CLIENT_URL
    if (origin === process.env.CLIENT_URL) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logger (only in dev to avoid log noise in production)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ── Static file serving ──────────────────────────────────────────────────────
// Serves uploaded files from backend/uploads/ at /uploads/<filename>
// This provides direct shareable links without needing AWS S3.
app.use('/uploads', express.static(UPLOAD_DIR));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/files',         fileRoutes);
app.use('/api/folders',       folderRoutes);
app.use('/api/user',          userRoutes);
app.use('/api/rooms',         roomRoutes);
app.use('/api/profile',       profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard',     dashboardRoutes);

// Health-check endpoint (used by Docker / load-balancers)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
// Must be last so it catches errors forwarded by next(error)
app.use(errorHandler);

// ── Socket.io setup ──────────────────────────────────────────────────────────
const allowedSocketOrigin = process.env.NODE_ENV !== 'production'
  ? /http:\/\/localhost:\d+$/
  : process.env.CLIENT_URL;

const io = new Server(server, {
  cors: {
    origin: allowedSocketOrigin,
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  socket.on('room:join', (roomId) => {
    if (roomId) {
      socket.join(roomId);
    }
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`🚀  Server running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);

  // Start background cleanup cron jobs
  startFileExpiryJob();
  startRoomExpiryJob();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌  Port ${PORT} is already in use.`);
    console.error(`   Run: lsof -ti :${PORT} | xargs kill -9   then restart.`);
  } else {
    console.error('❌  Server error:', err.message);
  }
  process.exit(1);
});
