
import express from 'express';
import {
    addLandlordReview,
    addTenantReview,
    getLandlordReviews,
    getTenantReviews,
    getReviewById,
    deleteReview,
    getReviews
} from '../controllers/reviewsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();


// REVIEWS ROUTES
router.post('/landlord/:landlordId', protect, addLandlordReview);
router.post('/tenant/:tenantId', protect, addTenantReview);
router.get('/landlord/:landlordId', protect, getLandlordReviews);
router.get('/tenant/:tenantId', protect, getTenantReviews);
router.get('/:reviewId', protect, getReviewById);


// ADMIN ONLY
router.delete('/:reviewId', protect, authorizeRoles("admin"), deleteReview);
router.get('/', protect, authorizeRoles("admin"), getReviews);

export default router;