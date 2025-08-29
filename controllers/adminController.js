import User from '../models/userModel.js';
import Property from "../models/propertyModel.js";
import Report from "../models/reportModel.js";
import Verification from '../models/verification.js'; // Use uppercase for consistency

// Fetch all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const listVerifications = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const items = await Verification.find({ status })
      .populate('user', 'name email role kycStatus')
      .sort({ submittedAt: -1 });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'List failed', error: err.message });
  }
};

// POST /api/admin/verification/:id/review  { action: 'approve'|'reject', note? }
export const reviewVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, note } = req.body;

    const v = await Verification.findById(id).populate('user', '_id role');
    if (!v) return res.status(404).json({ success: false, message: 'Verification not found' });
    if (!['approve','reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'action must be approve or reject' });
    }

    v.status = action === 'approve' ? 'approved' : 'rejected';
    v.notes = note || '';
    v.reviewer = req.user._id;
    v.reviewedAt = new Date();
    await v.save();

    // update user badge flags
    const user = await User.findById(v.user._id);
    if (v.status === 'approved') {
      user.isVerified = true;          // global verified
      user.kycStatus = 'verified';   // keep legacy field in sync
    } else {
      user.kycStatus = 'rejected';
    }
    await user.save();

    res.json({ success: true, message: `Verification ${v.status}`, verification: v });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Review failed', error: err.message });
  }
};


// Suspend a user
export const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.accountStatus = 'suspended';
    await user.save();
    res.json({ success: true, message: 'User suspended successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//VIEW ALL PROPERTY LISTED BY ADMIN
export const viewAllListedProperty = async (req, res) => {
  try {
    const property = await Property.find();
    if (!property.length) {
      return res.status(404).json({ success: false, message: "No property found" });
    }

    res.status(200).json({
      success: true,
      message: "Property found successfully",
      property
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Get all pending listings
export const getPendingListings = async (req, res) => {
  try {
    const listings = await Property.find({ status: 'pending' });
    res.json({ success: true, listings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve listing
export const approveListing = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }
    res.json({ success: true, message: 'Listing approved', property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reject listing
export const rejectListing = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }
    res.json({ success: true, message: 'Listing rejected', property });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all reports
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'name email') // Use the correct field name as in your model
      .populate('property', 'title');
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get analytics
export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Property.countDocuments();
    const approvedListings = await Property.countDocuments({ status: 'approved' });
    const pendingListings = await Property.countDocuments({ status: 'pending' });
    const totalReports = await Report.countDocuments();

    res.json({
      success: true,
      totalUsers,
      totalListings,
      approvedListings,
      pendingListings,
      totalReports
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
