import multer from "multer";

const storage = multer.memoryStorage();

const verificationFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported verification document. Only JPG, JPEG, PNG and PDF files are allowed."
      ),
      false
    );
  }
};

const uploadVerification = multer({
  storage,
  fileFilter: verificationFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per document
  },
});

export default uploadVerification;