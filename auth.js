const jwt = require('jsonwebtoken');
const User = require('../models/user'); // ✅ Ensure the path is correct

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // Use decoded.userId if your token has 'userId' field, not 'id'
    const userId = decoded.userId || decoded.id; 

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    req.user = user; // Now req.user._id will be available
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = authenticate;
