import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import {
  addFavourite,
  deletePropertyById,
  getFavourite,
  getLandlordProperties as getLandlordProperties,
  getMyReports,
  listProperty as listProperty,
  removeFavourite,
  reportProperty,
  updateAPropertyById,
  viewAllListedProperty as viewAllListedProperty,
  viewPropertyById as viewPropertyById
} from '../controllers/propertyController.js';

const router = express.Router();


// ROUTES FOR PROPERTY LISTINGS
router.post('/listings', protect, listProperty);
router.get("/listings", protect, viewAllListedProperty);
router.get("/listings/:landlordId/properties", protect, getLandlordProperties);
router.get("/listings/detail/:id", protect, viewPropertyById);
router.put("/listings/update/:id", protect, updateAPropertyById);
router.delete("/listings/delete/:id", protect, deletePropertyById);


// ROUTES FOR FAVOURITES
router.get("/listings/:propertyId/favourite", protect, getFavourite);
router.post("/listings/:propertyId/favourite", protect, addFavourite);
router.delete("/listings/:propertyId/favourite", protect, removeFavourite);



// ROUTES FOR REPORTS
router.get("/reports/:id", protect, getMyReports);
router.post("/report/:propertyId", protect, reportProperty);

export default router;