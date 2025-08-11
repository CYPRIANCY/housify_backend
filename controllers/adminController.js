import User from '../models/userModel.js';
// import Property from '../models/Property.js';
// import Report from '../models/Report.js';

// Fetch all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Suspend a user
export const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.accountStatus = 'suspended';
    await user.save();
    res.json({ message: 'User suspended successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify a user
export const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.verificationStatus = 'approved';
    await user.save();
    res.json({ message: 'User verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all pending listings
export const getPendingListings = async (req, res) => {
  try {
    const listings = await Property.find({ status: 'pending' });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Approve listing
export const approveListing = async (req, res) => {
  try {
    await Property.findByIdAndUpdate(req.params.id, { status: 'approved' });
    res.json({ message: 'Listing approved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject listing
export const rejectListing = async (req, res) => {
  try {
    await Property.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    res.json({ message: 'Listing rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all reports
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find().populate('reportedBy', 'name email').populate('property', 'title');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      totalUsers,
      totalListings,
      approvedListings,
      pendingListings,
      totalReports
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
