import Reviews from "../models/reviewsModel.js";
import User from "../models/userModel.js";



// GET REVIEWS
export const getReviews = async (req, res) => {
    try {
        const propertyId = req.params.propertyId;
        const reviews = await Reviews.find({ propertyId })
            .populate("userId", "username")
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ADD LANDLORD REVIEW
export const addLandlordReview = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const { rating, comment } = req.body;

    const reviewer = req.user.id;

    if (!landlordId || !reviewer) {
      return res.status(400).json({ message: "Landlord ID and Reviewer are required" });
    }

    const reviewerExists = await User.findById(reviewer);
    if (!reviewerExists) {
      return res.status(404).json({ message: "Reviewer not found" });
    }

    const newReview = new Reviews({
      reviewer,
      reviewee: landlordId,
      rating,
      comment
    });

    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ADD TENANT REVIEW
export const addTenantReview = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { rating, comment } = req.body;

    const reviewer = req.user.id;

    if (!tenantId || !reviewer) {
      return res.status(400).json({ message: "Landlord ID and Reviewer are required" });
    }

    const reviewerExists = await User.findById(reviewer);
    if (!reviewerExists) {
      return res.status(404).json({ message: "Reviewer not found" });
    }

    const newReview = new Reviews({
      reviewer,
      reviewee: tenantId,
      rating,
      comment
    });

    await newReview.save();
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//  GET LANDLORD REVIEWS
export const getLandlordReviews = async (req, res) => {
    try {
        const landlordId = req.params.landlordId;
        if (!landlordId) {
            return res.status(400).json({ message: "Landlord ID is required" });
        }
        const reviews = await Reviews.find({ reviewee: landlordId })
            .populate("reviewer", "username")
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


//  GET TENANT REVIEWS
export const getTenantReviews = async (req, res) => {
    try {
        const tenantId = req.params.tenantId;
        if (!tenantId) {
            return res.status(400).json({ message: "Tenant ID is required" });
        }
        const reviews = await Reviews.find({ reviewee: tenantId })
            .populate("reviewer", "username")
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



// GET REVIEW BY ID
export const getReviewById = async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const review = await Reviews.findById(reviewId)
            .populate("reviewer", "username")
            .populate("reviewee", "username");

        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }
        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// ADMIN DELETE REVIEW
export const deleteReview = async (req, res) => {
    try {
        const reviewId = req.params.reviewId;
        const deletedReview = await Reviews.findByIdAndDelete(reviewId);

        if (!deletedReview) {
            return res.status(404).json({ message: "Review not found" });
        }

        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};