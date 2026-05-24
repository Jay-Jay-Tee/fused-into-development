import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
    },
});

const fileFilter = (req, file, multerCallback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        multerCallback(null, true);
    } else {
        const err = new Error('Only JPEG, PNG, and WebP images are allowed');
        err.statusCode = 400;
        multerCallback(err);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

const uploadSingle   = upload.single('image');
const uploadMultiple = upload.array('images', 5);
const uploadFields   = upload.fields([
    { name: 'logo',        maxCount: 1 },
    { name: 'bannerImage', maxCount: 1 },
]);

export { uploadSingle, uploadMultiple, uploadFields };
