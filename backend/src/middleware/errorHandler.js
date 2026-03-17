/**
 * Global error-handling middleware.
 * Must be registered AFTER all routes so Express routes errors here
 * when next(error) is called or an unhandled exception occurs.
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  // Default to 500 if no status code was set earlier
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  // Dev: include stack trace; Prod: omit it
  const response = {
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }

  // Handle duplicate key errors (e.g. duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: `${field} already exists` });
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
