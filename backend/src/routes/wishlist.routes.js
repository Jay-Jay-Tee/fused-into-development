import express from 'express';
const router = express.Router();

import { wishlistController } from '../controller/wishlistController.js';
import { asyncHandler }       from '../middleware/asyncHandler.js';
import { auth }               from '../middleware/auth.js';
import { role }               from '../middleware/role.js';

// ----- PUBLIC ROUTES --------------

// ----- PROTECTED ROUTES --------------
router.get(
    '/',
    auth,
    role("buyer", "vendor"),
    asyncHandler(wishlistController.getWishlist)
);

router.post(
    '/items',
    auth,
    role("buyer", "vendor"),
    asyncHandler(wishlistController.addToWishlist)
);

router.delete(
    '/items/:productId',
    auth,
    role("buyer", "vendor"),
    asyncHandler(wishlistController.removeFromWishlist)
);

export { router as wishlistRoutes };

