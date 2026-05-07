const mongoose = require('mongoose');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found in database' });
    }

    if (user.security && user.security.isBlocked) {
      return res.status(403).json({ error: 'Account blocked', isBlocked: true });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token: ' + err.message });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.profile && (req.user.profile.role === 'ADMIN' || req.user.auth.email === 'pranayHeroAi@gmail.com' || req.user.auth.email === 'riturajvashisth@gmail.com')) {
    next();
  } else {
    res.status(403).json({ error: 'Access Denied: Master Admin privileges required' });
  }
};

module.exports = { verifyToken, verifyAdmin };

