import express from 'express';
const router = express.Router();

import { adminController } from '../controller/adminController.js';
import { asyncHandler }      from '../middleware/asyncHandler.js';
import { auth }              from '../middleware/auth.js';
import { role }              from '../middleware/role.js';

// ----- PUBLIC ROUTES (no auth required) ------------------

// ----- PROTECTED ROUTES -----------------------------------

// returns total sales and 5 top vendors for now
router.get(
    '/analytics',
    auth,
    role("admin"),
    asyncHandler(adminController.getAnalytics)
);

router.get(
    '/vendors/pending',
    auth,
    role("admin"),
    asyncHandler(adminController.getPendingVendors)
);

router.post(
    '/categories',
    auth,
    role("admin"),
    asyncHandler(adminController.addCategory)
);

router.get(
    '/commission',
    auth,
    role("admin"),
    asyncHandler(adminController.getCommission)
);

router.put(
    '/commission',
    auth,
    role("admin"),
    asyncHandler(adminController.updateCommission)
);

router.post(
    '/payouts/disburse',
    auth,
    role("admin"),
    asyncHandler(adminController.disbursePayout)
);

router.get(
    '/payouts',
    auth,
    role("admin"),
    asyncHandler(adminController.getPayouts)
);

router.put(
    '/categories/:id',
    auth,
    role("admin"),
    asyncHandler(adminController.updateCategory)
);
router.delete(
    '/categories/:id',
    auth,
    role("admin"),
    asyncHandler(adminController.deleteCategory)
);

router.get(
    '/users',
    auth,
    role("admin"),
    asyncHandler(adminController.getUsers)
);

router.get(
    '/users/:id',
    auth,
    role("admin"),
    asyncHandler(adminController.getUserById)
);

router.put(
    '/users/:id/ban',
    auth,
    role("admin"),
    asyncHandler(adminController.banUser)
);

router.get(
    '/orders',
    auth,
    role("admin"),
    asyncHandler(adminController.getAdminOrders)
);

export { router as adminRoutes };