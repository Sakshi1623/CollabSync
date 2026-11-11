const jwt = require('jsonwebtoken');

/**
 * Generate JWT token containing user id and role
 * Token expires in 7 days
 */
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = generateToken;
