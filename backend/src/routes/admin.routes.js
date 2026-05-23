import express from 'express';
const router = express.Router();

import { adminService }      from '../services/adminService.js';
import { asyncHandler }      from '../middleware/asyncHandler.js';
import { auth }              from '../middleware/auth.js';
import { role }              from '../middleware/role.js';

// ----- PUBLIC ROUTES (no auth required) ------------------

// ----- PROTECTED ROUTES -----------------------------------

router.get(
    '/analytics',
    auth,
    role("admin"),
    asyncHandler(adminService.getAnalytics)
)

router.get(
    'vendors/pending',
    auth,
    role("admin"),
    asyncHandler(adminService.getPendingVendors)
)

router.post(
    'categories',
    auth,
    role("admin"),
    asyncHandler(adminService.addCategory)
)

router.put(
    'commission',
    auth,
    role("admin"),
    asyncHandler(adminService.updateCommission)
)

export { router as orderRoutes };