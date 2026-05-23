import express from 'express';
const router = express.Router();

import { adminController }   from '../controller/adminController.js';
import { asyncHandler }      from '../middleware/asyncHandler.js';
import { auth }              from '../middleware/auth.js';
import { role }              from '../middleware/role.js';

// ----- PUBLIC ROUTES (no auth required) ------------------

// ----- PROTECTED ROUTES -----------------------------------

router.get(
    '/analytics',
    auth,
    role("admin"),
    asyncHandler(adminController.getAnalytics)
)

router.get(
    'vendors/pending',
    auth,
    role("admin"),
    asyncHandler(adminController.getPendingVendors)
)

router.post(
    'categories',
    auth,
    role("admin"),
    asyncHandler(adminController.addCategory)
)

router.put(
    'commission',
    auth,
    role("admin"),
    asyncHandler(adminController.updateCommission)
)

export { router as orderRoutes };