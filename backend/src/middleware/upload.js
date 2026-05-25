import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { AppError } from '../utils/appError.js';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const makeStorage = (folder) => new CloudinaryStorage({
    cloudinary,
    params: {
        folder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation:  [{ quality: 'auto', fetch_format: 'auto' }],
    },
});

const fileFilter = (req, file, multerCallback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        multerCallback(null, true);
    } else {
        const err = new AppError('Only JPEG, PNG, and WebP images are allowed', 400);
        multerCallback(err);
    }
};

const limits = { fileSize: 5 * 1024 * 1024 };

const uploadSingle   = multer({ storage: makeStorage('products'),       fileFilter, limits }).single('image');
const uploadMultiple = multer({ storage: makeStorage('products'),       fileFilter, limits }).array('images', 5);
const uploadFields   = multer({ storage: makeStorage('vendor-profile'), fileFilter, limits }).fields([
    { name: 'logo',        maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 },
]);

export { uploadSingle, uploadMultiple, uploadFields };