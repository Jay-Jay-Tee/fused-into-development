import express from 'express';
const router = express.Router();

import { refundService }     from '../services/refundService.js';
import { asyncHandler }      from '../middleware/asyncHandler.js';
import { auth }              from '../middleware/auth.js';
import { role }              from '../middleware/role.js';

// ----- PUBLIC ROUTES (no auth required) ------------------

// ----- PROTECTED ROUTES -----------------------------------

router.post(
    '/',
    auth,
    role("buyer"),
    asyncHandler(refundService.raiseRefund)
)

router.get(
    '/',
    auth,
    role("admin"),
    asyncHandler(refundService.getAllRefunds)
)

router.get(
    '/my',
    auth,
    role("buyer"),
    asyncHandler(refundService.getBuyerRefunds)
)

router.get(
    '/:id',
    auth,
    role("buyer", "admin"),
    asyncHandler(refundService.getRefundById)   // get refund by ID should check role
)

router.put(
    '/:id/approve',
    auth,
    role("admin"),
    asyncHandler(refundService.approveRefund)
)
router.put(
    '/:id/reject',
    auth,
    role("admin"),
    asyncHandler(refundService.rejectRefund)
)

export { router as productRoutes };