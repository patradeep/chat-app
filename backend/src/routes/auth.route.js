import express from 'express';
import { chakeAuth, login, logout, signup, updateProfile } from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.middleware.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
  // Remove the upload_preset line
});

router.post('/login', login);

router.post('/signup', signup)

router.post('/logout', logout)

router.put('/update-profile', auth, upload.single('avatar'), updateProfile);

router.get('/check',auth, chakeAuth)

export default router;