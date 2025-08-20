import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { 
  getUserHistory,
  addHistory,
    updateHistory,
    deleteHistory,
    getHistoryByProperty,
    getHistoryById
} from '../controllers/historyController.js';
  
const router = express.Router();

// HISTORY ROUTES
router.get('/history/:userId', protect, getUserHistory);
router.post('/history', protect, addHistory);
router.put('/history/:historyId', protect, updateHistory);
router.delete('/history/:historyId', protect, deleteHistory);
router.get('/history/property/:propertyId', protect, getHistoryByProperty);
router.get('/history/:historyId', protect, getHistoryById);


export default router;