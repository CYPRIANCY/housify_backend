import express from 'express';
import {
  getAllUsers,
  suspendUser,
  deleteUser,
  getPendingListings,
  approveListing,
  rejectListing,
  getReports,
  getAnalytics,
  viewAllListedProperty,
  reviewVerification,
  listVerifications
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { getUsersWithVerificationStatus } from '../controllers/adminController.js';

const router = express.Router();

router.get('/users', protect, authorizeRoles('admin'), getAllUsers);

router.put('/users/:id/suspend', protect, authorizeRoles('admin'), suspendUser);

router.delete('/users/:id', protect, authorizeRoles('admin'), deleteUser);

// getUsersWithVerificationStatus

router.get('/users/verification-status', protect, authorizeRoles('admin'), getUsersWithVerificationStatus);

// router.put('/users/:id/verify', protect, authorizeRoles('admin'), verifyUser);

router.get('/verification', protect, authorizeRoles('admin'), listVerifications); // ?status=pending|approved|rejected
router.post('/verification/:id/review', protect, authorizeRoles('admin'), reviewVerification);
   
// ONLY ADMIN CAN VIEW ALL PROPERTY
router.get("/listings", protect, authorizeRoles("admin"), viewAllListedProperty);

router.get('/listings/pending', protect, authorizeRoles('admin'), getPendingListings);
router.put('/listings/:id/approve', protect, authorizeRoles('admin'), approveListing);
router.put('/listings/:id/reject', protect, authorizeRoles('admin'), rejectListing);

router.get('/reports', protect, authorizeRoles('admin'), getReports);
router.get('/analytics', protect, authorizeRoles('admin'), getAnalytics);

export default router;
