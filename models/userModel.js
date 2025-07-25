import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["tenant", "landlord", "admin"],
      default: "tenant",
    },
    isVerified: { type: Boolean, default: false },

    otp: String,
    otpExpires: Date,
  },
  { timestamps: true }
);

// 🔐 Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔐 Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


// 🔐 Generate OTP
userSchema.methods.generateOTP = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = crypto.createHash("sha256").update(otp).digest("hex");
  this.otp = hash;
  this.otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins
  return otp; // return plain OTP to send via email
};

// 🔐 Verify OTP
userSchema.methods.verifyOTP = function (enteredOTP) {
  const hash = crypto.createHash("sha256").update(enteredOTP).digest("hex");
  return this.otp === hash && this.otpExpires > Date.now();
};

// 🔐 Clear OTP after verification or expiry
userSchema.methods.clearOTP = function () {
  this.otp = undefined;
  this.otpExpires = undefined;
};

export default mongoose.model("User", userSchema);
