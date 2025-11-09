import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";

dotenv.config(); // Ensure environment variables are loaded

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
    // secure: true, // ensures HTTPS URLs
});

export default cloudinary;