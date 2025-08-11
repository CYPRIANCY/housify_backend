import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const protect = async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token)
    return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    
    // if(!user){
    //     return res.status(404).json({message: "User account does not exist"})
    // }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};


// export const protect = async (req, res, next) => {
//   let token;

//   // Proper fallback logic
//   if (req.cookies?.accessToken) {
//     token = req.cookies.accessToken;
//   } else if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith('Bearer ')
//   ) {
//     token = req.headers.authorization.split(' ')[1];
//   }

//   if (!token) {
//     return res.status(401).json({ message: 'Not authorized, no token' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.userId || decoded.id).select('-password');

//     if (!user) {
//       return res.status(401).json({ message: 'User not found' });
//     }

//     req.user = user;
//     next();
//   } catch (err) {
//     console.error(err);
//     return res.status(401).json({ message: 'Invalid or expired token' });
//   }
// };
