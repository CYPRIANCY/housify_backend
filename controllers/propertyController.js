import User from "../models/userModel.js";
import Property from "../models/propertyModel.js";
import Report from "../models/reportModel.js";
import { detectFraud } from "../utils/fraudDetection.js";
import { logHistory } from "./historyLogger.js";
import { v2 as cloudinary } from "cloudinary";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

// LIST A PROPERTY
// export const listProperty = async (req, res) => {
//   const token = req.cookies.accessToken;
//   if (!token) {
//     return res.status(401).json({ success: false, message: "User not authenticated: please login" });
//   }

//   try {
//     const {
//       title,
//       description,
//       listingType,
//       price,
//       currency,
//       location,
//       features,
//       contact,
//       ownership,
//       propertyType,
//       status,
//       condition,
//       blockNumber
//     } = req.body;

//     const fraudCheck = await detectFraud({
//       title,
//       description,
//       listingType,
//       price,
//       currency,
//       location,
//       features,
//       contact,
//       ownership,
//       propertyType,
//       status,
//       condition,
//       blockNumber
//     });

//     if (fraudCheck.isFraud) {
//       return res.status(400).json({
//         success: false,
//         message: "Fraudulent listing detected",
//         reason: fraudCheck.reason
//       });
//     }

//     // Unified media handling
//     let media = {};
//     if (req.file && req.file.path) {
//       media.images = { url: req.file.path, public_id: req.file.filename };
//     }
//     if (req.files && req.files.video && req.files.video[0]) {
//       media.videos = { url: req.files.video[0].path, public_id: req.files.video[0].filename };
//     }
//     if (req.files && req.files.floorPlan && req.files.floorPlan[0]) {
//       media.floorPlan = { url: req.files.floorPlan[0].path, public_id: req.files.floorPlan[0].filename };
//     }

//     const property = new Property({
//       title,
//       description,
//       listingType,
//       price,
//       currency,
//       location,
//       features,
//       contact,
//       ownership,
//       propertyType,
//       status,
//       condition,
//       userId: req.user._id || req.user.id,
//       media,
//       metadata: {
//         dateListed: new Date(),
//         isVerified: false,
//         views: 0,
//         status: "active"
//       }
//     });

//     await property.save();

//     // Log history
//     await logHistory({
//       userId: req.user._id || req.user.id,
//       propertyId: property._id,
//       role: req.user.role,
//       action: "Property Listed",
//       notes: "Landlord listed a new property",
//     });

//     res.status(201).json({
//       success: true,
//       message: "Property listed successfully",
//       property
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// ✅ Create Property Listing
export const listProperty = async (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated: please login",
    });
  }

  try {
    const {
      title,
      description,
      listingType,
      price,
      currency,
      location,
      features,
      contact,
      ownership,
      propertyType,
      status,
      condition,
      blockNumber,
    } = req.body;

    // ✅ Step 1: Fraud detection check
    const fraudCheck = await detectFraud({
      title,
      description,
      listingType,
      price,
      currency,
      location,
      features,
      contact,
      ownership,
      propertyType,
      status,
      condition,
      blockNumber,
    });

    if (fraudCheck.isFraud) {
      return res.status(400).json({
        success: false,
        message: "Fraudulent listing detected",
        reason: fraudCheck.reason,
      });
    }

    // Handle uploaded media
    const media = {};

    if (req.files?.image?.length) {
      const image = req.files.image[0];

      const imageResult = await uploadToCloudinary(
        image.buffer,
        "properties/images",
        "image"
      );

      media.images = {
        url: imageResult.secure_url,
        public_id: imageResult.public_id,
      };
    }

    if (req.files?.video?.length) {
      const video = req.files.video[0];

      const videoResult = await uploadToCloudinary(
        video.buffer,
        "properties/videos",
        "video"
      );

      media.videos = {
        url: videoResult.secure_url,
        public_id: videoResult.public_id,
      };
    }

    // ✅ Step 3: Create property record
    const property = new Property({
      title,
      description,
      listingType,
      price,
      currency,
      location,
      features,
      contact,
      ownership,
      propertyType,
      status,
      condition,
      blockNumber,
      userId: req.user._id || req.user.id,
      media,
      metadata: {
        dateListed: new Date(),
        isVerified: false,
        views: 0,
        status: "active",
      },
    });

    await property.save();

    // ✅ Step 4: Log user action
    await logHistory({
      userId: req.user._id || req.user.id,
      propertyId: property._id,
      role: req.user.role,
      action: "Property Listed",
      notes: "Landlord listed a new property",
    });

    // ✅ Step 5: Send response
    res.status(201).json({
      success: true,
      message: "Property listed successfully",
      property,
    });
  } catch (error) {
    console.error("Error listing property:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to list property",
    });
  }
};

// VIEW ALL PROPERTIES
export const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Properties fetched successfully",
      count: properties.length,
      properties
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET VERIFIED PROPERTIES
export const getVerifiedProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      status: "approved"
    }).sort({ createdAt: -1 });
    
    console.log("Fetching approved properties, found:", properties.length);
    
    res.status(200).json({
      success: true,
      message: "Verified properties fetched successfully",
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error("Error fetching verified properties:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// LANDLORD CAN VIEW A PROPERTY LISTED BY ID
// LANDLORD CAN VIEW A PROPERTY LISTED BY ID
export const viewPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id).populate("userId", "name email");

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    // Increment view count
    property.metadata.views = (property.metadata.views || 0) + 1;
    await property.save();

    res.status(200).json({
      success: true,
      message: "Property found",
      property
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// LANDLORD CAN VIEW ALL PROPERTIES LISTED BY ID
export const getLandlordProperties = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const properties = await Property.find({ userId: landlordId });

    res.status(200).json({
      success: true,
      message: "All properties listed",
      count: properties.length,
      properties
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// LANDLORD CAN UPDATE A PROPERTY
export const updateAPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id.length === 0) {
      return res.status(400).json({ success: false, message: "Property ID is missing" });
    }

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ success: false, message: "No property found" });
    }

    // Optional: Only allow owner to update
    if (property.userId.toString() !== (req.user._id || req.user.id).toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      updatedProperty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// LANDLORD CAN DELETE A PROPERTY FROM LISTINGS
export const deletePropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id.length === 0) {
      return res.status(400).json({ success: false, message: "Property ID is missing" });
    }

    const deletedProperty = await Property.findById(id);
    if (!deletedProperty) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    // Optional: Only allow owner to delete
    if (deletedProperty.userId.toString() !== (req.user._id || req.user.id).toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (deletedProperty.media && deletedProperty.media.images && deletedProperty.media.images.public_id) {
      await cloudinary.uploader.destroy(deletedProperty.media.images.public_id);
    }

    await Property.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Property deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ADD PROPERTY TO FAVOURITE
export const addFavourite = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select("-password");
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    if (!Array.isArray(user.favourites)) {
      user.favourites = [];
    }

    const index = user.favourites.findIndex(
      (id) => id.toString() === propertyId
    );

    if (index > -1) {
      return res.status(200).json({
        success: false,
        message: "Property already in favourite"
      });
    } else {
      user.favourites.push(propertyId);
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Property added to favourite successfully"
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// REMOVE PROPERTY FROM FAVOURITES
export const removeFavourite = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select("-password");
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found"
      });
    }

    if (!Array.isArray(user.favourites)) {
      user.favourites = [];
    }

    const index = user.favourites.findIndex(
      (id) => id.toString() === propertyId
    );

    if (index > -1) {
      user.favourites.splice(index, 1);
      await user.save();
      return res.status(200).json({
        success: true,
        message: "Property removed from favourite successfully"
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Property not in favourite"
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET FAVOURITES
export const getFavourite = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).populate("favourites").select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res.status(200).json({
      success: true,
      message: "All favourites",
      count: user.favourites ? user.favourites.length : 0,
      favourites: user.favourites || []
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// A PROPERTY CAN BE REPORTED
export const reportProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { reason } = req.body;

    const newReport = new Report({
      reporter: req.user._id || req.user.id,
      property: propertyId,
      reason
    });

    await newReport.save();

    res.status(201).json({
      success: true,
      message: "Property reported",
      newReport
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// USER CAN GET THEIR REPORTS
export const getMyReports = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    const reports = await Report.find({ reporter: userId }).populate("property");

    res.status(200).json({
      success: true,
      message: "All reports",
      reports: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};