const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Assuming token format "Bearer <token>"
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
    req.admin = decoded.admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
