import express from 'express';
const router = express.Router();

import { reviewController } from '../controller/reviewController.js';
import { asyncHandler }      from '../middleware/asyncHandler.js';
import { auth }              from '../middleware/auth.js';
import { role }              from '../middleware/role.js';

// ----- PUBLIC ROUTES (no auth required) ------------------

// get all products
router.get(
    '/product/:id',
    asyncHandler(reviewController.getProductReviews)
);


router.get(
    '/vendor/:id',
    asyncHandler(reviewController.getVendorReviews)
);

// ----- PROTECTED ROUTES -----------------------------------

// add product
router.post(
    '/product/:id',
    auth,
    role("buyer"),
    asyncHandler(reviewController.createProductReview)
);

router.post(
    '/vendor/:id',
    auth,
    role("buyer"),
    asyncHandler(reviewController.createVendorReview)
);

export { router as reviewRoutes };