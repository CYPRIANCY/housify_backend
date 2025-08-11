import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendOTPEmail } from "../utils/sendEmail.js";

// Generate short-lived access token
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

// Generate long-lived refresh token
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

// REGISTER
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  if (role && !["tenant", "landlord"].includes(role))
    return res.status(403).json({ message: "You are not allowed to register as admin" });

  const existingUser = await User.findOne({ email });

  if (existingUser) return res.status(400).json({ message: "Email already exists" });

  const otp = crypto.randomInt(100000, 999999).toString();

  const user = await User.create({
    name,
    email,
    password,
    role: role || "tenant",
    otp,
    otpExpires: Date.now() + 10 * 60 * 1000,
    isVerified: false,
  });

  await sendOTPEmail(email, "Verify your email", otp);

  res.status(201).json({
    message: "Registered successfully. Check your email for OTP.",
    userId: user._id,
    role: user.role,
  });
};

// LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))){
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (!user.isVerified){
    return res.status(403).json({ message: "Email not verified. Please verify to login." });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
console.log("User role:", user.role)
  res.status(200).json({
    message: "Login successful",
    accessToken,
    user: { id: user._id, role: user.role },
  });
};

// REFRESH TOKEN
export const refreshAccessToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "Refresh token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    const newAccessToken = generateAccessToken(user);
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ message: "Token refreshed" });
  } catch (err) {
    res.status(403).json({ message: "Expired or invalid refresh token" });
  }
};

// LOGOUT
export const logoutUser = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
};

// VERIFY EMAIL
export const verifyEmailOTP = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.otp || !user.otpExpires)
    return res.status(400).json({ message: "Invalid or expired OTP" });

  if (user.otp !== otp || user.otpExpires < Date.now())
    return res.status(400).json({ message: "Incorrect or expired OTP" });

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.status(200).json({ message: "Email verified successfully" });
};

// RESEND OTP
export const resendOTP = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = crypto.randomInt(100000, 999999).toString();
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendOTPEmail(email, "Your new OTP Code", otp);
  res.status(200).json({ message: "OTP resent successfully" });
};

// FORGOT PASSWORD
export const sendResetOTP = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const otp = crypto.randomInt(100000, 999999).toString();
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendOTPEmail(email, "Password Reset OTP", otp);
  res.status(200).json({ message: "Reset OTP sent to email" });
};

// RESET PASSWORD
export const resetPasswordWithOTP = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user || user.otp !== otp || user.otpExpires < Date.now())
    return res.status(400).json({ message: "Invalid or expired OTP" });

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  res.status(200).json({ message: "Password reset successful" });
};
