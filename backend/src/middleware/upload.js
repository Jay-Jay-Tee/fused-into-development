import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { AppError } from '../utils/appError.js';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const makeStorage = () => new CloudinaryStorage({
    cloudinary,
    params: async (req) => ({
        folder: req.uploadFolder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    }),
});

const fileFilter = (req, file, multerCallback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        multerCallback(null, true);
    } else {
        multerCallback(new AppError('Only JPEG, PNG, and WebP images are allowed', 400));
    }
};

const limits = { fileSize: 5 * 1024 * 1024 };

// Single shared storage instance — folder is driven by req.uploadFolder at request time.
const storage = makeStorage();

// Products: up to 5 images. Controller sets req.uploadFolder before this runs.
const uploadMultiple = multer({ storage, fileFilter, limits }).array('images', 5);

// Vendor profile: logo + bannerImage. Controller sets req.uploadFolder before this runs.
const uploadFields = multer({ storage, fileFilter, limits }).fields([
    { name: 'logo',        maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 },
]);

export { uploadMultiple, uploadFields, cloudinary };