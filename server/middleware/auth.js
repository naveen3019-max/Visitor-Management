const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

// Verify JWT token from HTTP-only cookie
const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    console.log(`Authorization check - Required roles: [${roles.join(', ')}], User role: ${req.user?.role}`);
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this resource. Required roles: [${roles.join(', ')}]`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
