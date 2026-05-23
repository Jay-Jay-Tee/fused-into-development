import multer from 'multer';

const storage = multer.memoryStorage();

// mult follows callback of form (err, acceptFile) 
const fileFilter = (req, file, multerCallback) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        multerCallback(null, true); // accept
    } else {
        const err = new Error('Only JPEG, PNG, and WebP images are allowed');
        err.statusCode = 400;
        multerCallback(err);
    }
};

// ----- Multer instance ------------------------------------
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB per file
    },
});

// ----- Exported middleware variants -------------------


// Usage: router.post('/logo', auth, uploadSingle, controller)
const uploadSingle = upload.single('image');


// Usage: router.post('/', auth, uploadMultiple, controller)
const uploadMultiple = upload.array('images', 5);


// Then in the controller: req.files['logo'][0], req.files['banner'][0]
const uploadFields = upload.fields([
    { name: 'logo',   maxCount: 1 },
    { name: 'banner', maxCount: 1 },
]);

export { uploadSingle, uploadMultiple, uploadFields };