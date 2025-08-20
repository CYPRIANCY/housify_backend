
import express from 'express';
import {
    addLandlordReview,
    addTenantReview,
    getLandlordReviews,
    getTenantReviews,
    getReviewById,
    deletedReview,
    getReviews
} from '../controllers/reviewsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();


// REVIEWS ROUTES
router.post('/reviews/landlord/:landlordId', protect, addLandlordReview);
router.post('/reviews/tenant/:tenantId', protect, addTenantReview);
router.get('/reviews/landlord/:landlordId', protect, getLandlordReviews);
router.get('/reviews/tenant/:tenantId', protect, getTenantReviews);
router.get('/reviews/:reviewId', protect, getReviewById);


// ADMIN ONLY
router.delete('/reviews/:reviewId', protect, authorizeRoles("admin"), deletedReview);
router.get('/reviews', protect, authorizeRoles("admin"), getReviews);

