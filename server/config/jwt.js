const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token containing user ID and role
 * @param {string} userId - User's MongoDB _id
 * @param {string} role - User's role ('student' or 'admin')
 * @returns {string} Signed JWT token valid for 7 days
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;
