import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const protect = async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token)
    return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = {id: decoded.id};
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
