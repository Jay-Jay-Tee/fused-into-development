import express from 'express';
const router = express.Router();

import { refundController }  from '../controller/refundController.js';
import { asyncHandler }      from '../middleware/asyncHandler.js';
import { auth }              from '../middleware/auth.js';
import { role }              from '../middleware/role.js';

// ----- PUBLIC ROUTES (no auth required) ------------------

// ----- PROTECTED ROUTES -----------------------------------

router.post(
    '/',
    auth,
    role("buyer"),
    asyncHandler(refundController.raiseRefund)
)

router.get(
    '/',
    auth,
    role("admin"),
    asyncHandler(refundController.getAllRefunds)
)

router.get(
    '/my',
    auth,
    role("buyer"),
    asyncHandler(refundController.getBuyerRefunds)
)

router.get(
    '/:id',
    auth,
    role("buyer", "admin"),
    asyncHandler(refundController.getRefundById)   // get refund by ID should check role
)

router.put(
    '/:id/approve',
    auth,
    role("admin"),
    asyncHandler(refundController.approveRefund)
)
router.put(
    '/:id/reject',
    auth,
    role("admin"),
    asyncHandler(refundController.rejectRefund)
)

export { router as productRoutes };