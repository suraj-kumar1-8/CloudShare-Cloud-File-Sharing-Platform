const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect middleware.
 * Validates the JWT token from the Authorization header and
 * attaches the authenticated user to req.user.
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from "Bearer <token>" header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorised, no token provided' });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check the user still exists (they could have been deleted)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorised, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Not authorised, invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Not authorised, token expired' });
    }
    next(error);
  }
};

module.exports = { protect };
