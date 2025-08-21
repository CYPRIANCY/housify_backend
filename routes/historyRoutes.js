import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getUserHistory,
  addHistory,
    getHistoryById
} from '../controllers/historyController.js';
  
const router = express.Router();

// HISTORY ROUTES
router.get('/', protect, getUserHistory);

router.post('/', protect, addHistory);
router.get('/:historyId', protect, getHistoryById);


export default router;