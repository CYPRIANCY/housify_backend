import User from "../models/userModel.js";
import Property from "../models/propertyModel.js"
import jwt, { decode } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendOTPEmail } from "../utils/sendEmail.js";
import Report from "../models/reportModel.js";

//PROPERTY LISTING
export const listProperty = async (req, res) => {
    const token = req.cookies.accessToken;
        if (!token) {
            return res.status(404).json({success: false, message: "User not found: please login"})
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
        media,
    contact,
    status,
        condition,
    ownership,
        propertyType
        } = req.body;

       
        const property = new Property({
            title,
            description,
            listingType,
            price,
            currency,
            location,
            features,
            media,
            contact,
            ownership,
            propertyType,
            status,
            condition,
            userId: req.user.id,
            metadata: {
                dateListed: new Date(),
                isVerified: false,
                views: 0,
                status: "active"
            }
        });
        await property.save();

        res.status(201).json({
            success: true,
            message: "Property listed successfully",
            property
         }
            
        )  
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
};

//VIEW ALL PROPERTY LISTED BY ADMIN
export const viewAllListedProperty = async (req, res) => {
    try {
        
        const property = await Property.find();
        if (!property) {
            return res.status(404).json({success: false, message: "No property found"})
        };

        res.status(200).json({
            success: true,
            message: "Property found successfully",
            property
        })


    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

// LANDLORD CAN VIEW A PROPERTY LISTED BY ID
export const viewPropertyById = async (req, res) => {

    try {
        const { id } = req.params;
        const property = await Property.findById(id).populate("userId", "name email");

        if (!property) {
            return res.status(404).json({ success: false, message: "Property not found" });
        }

        res.status(200).json({
            success: true,
            message: "Property found",
            property
        })
        
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
};


// LANDLORD CAN VIEW ALL PROPERTIES LISTED BY ID
export const getLandlordProperties = async (req, res) => {

    try {
        const {landlordId} = req.params;

        const properties = await Property.find({ userId: landlordId });

        res.status(200).json({
            success: true,
            message: "All properties listed",
            count: properties.length,
            properties
        })
        
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
};


// LANDLORD CAN UPDATE A PROPERTY
export const updateAPropertyById = async (req, res) => {
try {
    const { id } = req.params;
     if (!id || id.length === 0) {
            return res.status(404).json({ success: false, message: "Property ID is missing" });
    }

    const userId = req.user.id;
    
    
    const property = await Property.findById(id);
     if (!property) {
            return res.status(404).json({ success: false, message: "No property found" });
        }
    
    const updatedProperty = await Property.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true });
    await updatedProperty.save();

    res.status(200).json({
        success: true,
        message: "Property updated successfully",
        updatedProperty
   })
    
} catch (error) {
    res.status(500).json({
        success: false,
        message: error.message
    })   
}
};


// LANDLORD CAN DELETE A PROPERTY FROM LISTINGS
export const deletePropertyById = async (req, res) => {
  try {
      const { id } = req.params;
      if (!id || id.length === 0) {
            return res.status(404).json({ success: false, message: "Property ID is missing" });
    }
      
      
      const deletedProperty = await Property.findById(id);
      
      await Property.findByIdAndUpdate(deletedProperty);
      res.status(200).json({
          success: true,
          message: "Propert deleted successfully"
      })
      
  } catch (error) {
      res.status(500).json({
          success: false,
          message: error.message
    })
  }  

};


// ADD PROPERTY TO FAVOURITE
export const addFavourite = async (req, res) => {
    try {
        const propertyId = req.params.propertyId;
        
        const userId = req.user.id
        const user = await User.findById(userId).select("-password");
        const property = await Property.findById(propertyId)
        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            })
        }

        if (!Array.isArray(user.favourites))  {user.favourites = []};
        
        const index = user.favourites.findIndex(
            (id) => id.toString() === propertyId
        );
        
        if (index > -1) {
            return res.status(200).json({
                success: false,
                message: "Property already in favourite"
            })
        } else {
            user.favourites.push(propertyId);
            await user.save();
            return res.status(200).json({
            success: true,
            message: "Property added to favourite successfully"
        })
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

};


// REMOVE PROPERTY FROM FAVOURITES
export const removeFavourite = async (req, res) => {
    try {
        const propertyId = req.params.propertyId;
        
        const userId = req.user.id
        const user = await User.findById(userId).select("-password");
        const property = await Property.findById(propertyId)
        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            })
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
        })
        } else {
            return res.status(404).json({
                success: false,
                message: "Property not in favourite"
            })
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
     })   
    }
};

// GET FAVOURITES
export const getFavourite = async (req, res) => {
    try {

        const propertyId = req.params.propertyId;
        
        const userId = req.user.id
        const user = await User.findById(userId).populate("favourites").select("-password");
        const property = await Property.findById(propertyId)
        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            })
        }
        
        const index = user.favourites.findIndex(
            (id) => id.toString() === propertyId
        );
        
        res.status(200).json({
            success: true,
            message: "All favourites",
            count: index,
            favourites: user.favourites
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};



// A PROPERTY CAN BE REPORTED
export const reportProperty = async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { reason } = req.body;

        const newReport = new Report({
            reporter: req.user.id,
            property: propertyId,
            reason
        });

        await newReport.save();

        res.status(201).json({
            success: true,
            message: "Property reported",
            newReport
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
};

// USER CAN GET THEIR REPORTS
export const getMyReports = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        const reports = await Report.find({ reporter: req.user._id }).populate("property");

        res.status(200).json({
            success: true,
            message: "All reports",
            reports: reports
        });
    } catch (error) {
        
    }
};