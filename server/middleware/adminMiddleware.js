/**
 * Admin Middleware
 * Verifies that the authenticated user (populated by protect middleware) has the 'admin' role
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Admin access required.'
    });
  }
};

module.exports = { adminOnly };
