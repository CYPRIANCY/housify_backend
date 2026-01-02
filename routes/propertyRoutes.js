import express from 'express';
import { protect } from '../middleware/authMiddleware.js';


import {
  addFavourite,
  deletePropertyById,
  getAllProperties,
  getVerifiedProperties,
  getFavourite,
  getLandlordProperties as getLandlordProperties,
  getMyReports,
  listProperty as listProperty,
  removeFavourite,
  reportProperty,
  updateAPropertyById,
  viewPropertyById as viewPropertyById
} from '../controllers/propertyController.js';
import { uploadImage, uploadVideo, uploadProperty  } from '../utils/multer.js';

const router = express.Router();

// ROUTES FOR PROPERTY LISTINGS
// router.post(
//   "/listings", protect,
//   uploadImage.array("images", 10),
//   uploadVideo.array("videos", 5),
//   // upload.fields([
//   //   { name: "images", maxCount: 10 },
//   //   { name: "videos", maxCount: 5 },
//   // ]),
//   // uploadImage.single("image"),
//   // uploadVideo.single("video"),
//   listProperty
// );

// ROUTES FOR PROPERTY LISTINGS
router.post(
  "/listings", 
  protect,
  uploadProperty.fields([
    { name: "image", maxCount: 10 },
    { name: "video", maxCount: 2 },
  ]),
  listProperty
);


router.get("/all", getAllProperties);
router.get("/verified", getVerifiedProperties);
router.get("/listings/:landlordId/properties", protect, getLandlordProperties);
router.get("/listings/detail/:id", viewPropertyById);

router.put("/listings/update/:id", protect, updateAPropertyById);
router.delete("/listings/delete/:id", protect, deletePropertyById);

// ROUTES FOR UPLOADING IMAGES AND VIDEOS
router.post("/upload/image", protect, uploadImage.single("image"));
router.post("/upload/video", protect, uploadVideo.single("video"));

// ROUTES FOR FAVOURITES
router.get("/listings/:propertyId/favourite", protect, getFavourite);
router.post("/listings/:propertyId/favourite", protect, addFavourite);
router.delete("/listings/:propertyId/favourite", protect, removeFavourite);



// ROUTES FOR REPORTS
router.get("/reports/:id", protect, getMyReports);
router.post("/report/:propertyId", protect, reportProperty);

export default router;