import express from 'express';
const router = express.Router();

import { vendorController } from '../controller/vendorController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { auth } from '../middleware/auth.js';
import { role } from '../middleware/role.js';
import { uploadFields } from '../middleware/upload.js';

// ----- PUBLIC ROUTES (no auth required) ------------------

// Does NOT return sensitive fields like commission rate or addresses.
router.get(
    '/:id',
    asyncHandler(vendorController.getVendorProfile)
);

// ----- PROTECTED ROUTES -----------------------------------

router.get(
    '/me',
    auth,
    role('vendor'),
    asyncHandler(vendorController.getMyVendorProfile)
);

router.post(
    '/register',
    auth,
    role('buyer'),
    uploadFields,
    asyncHandler(vendorController.registerVendor)
);

router.put(
    '/me',
    auth,
    role('vendor'),
    uploadFields,
    asyncHandler(vendorController.updateVendorProfile)
);

router.put(
    '/:id/approve',
    auth,
    role('admin'),
    asyncHandler(vendorController.approveVendor)
);

router.put(
    '/:id/reject',
    auth,
    role('admin'),
    asyncHandler(vendorController.rejectVendor)
);

// this one is to know if they've been made a vendor yet, so auth needed is that of a buyer
router.get(
    '/application/status',
    auth,
    role('buyer'),
    asyncHandler(vendorController.getApplicationStatus)
);
router.put(
    '/:id/commission',
    auth,
    role('admin'),
    asyncHandler(vendorController.updateVendorCommission)
);

export { router as vendorRoutes };