import express from 'express';
const router = express.Router();

import { cartController } from '../controller/cartController.js';
import { asyncHandler }   from '../middleware/asyncHandler.js';
import { auth }           from '../middleware/auth.js';
import { role }           from '../middleware/role.js';

// ----- PUBLIC ROUTES --------------

// ----- PROTECTED ROUTES --------------

router.get(
    '/',
    auth,
    role("buyer", "vendor"),
    asyncHandler(cartController.getCart)
);

router.post(
    '/items',
    auth,
    role("buyer", "vendor"),
    asyncHandler(cartController.addToCart)
);

router.put(
    '/items/:productId',
    auth,
    role("buyer", "vendor"),
    asyncHandler(cartController.updateCartItem)
);

router.delete(
    '/items/:productId',
    auth,
    role("buyer", "vendor"),
    asyncHandler(cartController.removeCartItem)
);

// clears the entire cart 
router.delete(
    '/',
    auth,
    role("buyer", "vendor"),
    asyncHandler(cartController.clearCart)
);

export { router as cartRoutes };