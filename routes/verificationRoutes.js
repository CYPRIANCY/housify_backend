// import express from 'express';
// // import upload from '../utils/multer.js';
// import { deleteVerificationDocument, getMyVerification, submitVerification } from '../controllers/verificationController.js';
// import { protect } from '../middleware/authMiddleware.js';
// import uploadVerification from '../utils/uploadVerification.js';

// const router = express.Router();

// // Expect multipart with fields: idDocs[], proofDocs[]
// // const multi = uploadVerification.fields([
// //   { name: 'idDocs', maxCount: 5 },
// //   { name: 'proofDocs', maxCount: 5 }
// // ]);


// // verification upload
// router.post("/submit", protect, uploadVerification.array("idDocs", 5), submitVerification);
// // router.post('/submit', protect, multi, submitVerification);
// router.get('/me', protect, getMyVerification);
// router.delete('/:verificationId/document', protect, deleteVerificationDocument);

// export default router;


import express from 'express';
// import upload from '../utils/multer.js';
import { deleteVerificationDocument, getMyVerification, submitVerification } from '../controllers/verificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import uploadVerification from '../utils/uploadVerification.js';

const router = express.Router();

// Expect multipart with fields: idDocs[], proofDocs[]
const multi = uploadVerification.fields([
  { name: 'idDocs', maxCount: 5 },
  { name: 'proofDocs', maxCount: 5 }
]);


// verification upload
router.post("/submit", protect, multi, submitVerification);
router.get('/me', protect, getMyVerification);
router.delete('/:verificationId/document', protect, deleteVerificationDocument);

export default router;

