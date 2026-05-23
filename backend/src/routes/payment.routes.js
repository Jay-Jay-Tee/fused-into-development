import express from 'express';
const router = express.Router();

import { paymentService }    from '../services/paymentService.js';
import { asyncHandler }      from '../middleware/asyncHandler.js';
import { auth }              from '../middleware/auth.js';
import { role }              from '../middleware/role.js';

// ----- PUBLIC ROUTES (no auth required) ------------------
router.post('/webhook', asyncHandler(paymentService.handleWebhook));

// ----- PROTECTED ROUTES -----------------------------------

// do payment for a product as a buyer
router.post(
  '/create-order',
  auth,
  role('buyer'),
  asyncHandler(paymentService.createOrder)
);
router.post(
  '/verify',
  auth,
  role('buyer'),
  asyncHandler(paymentService.verifyPayment)
);
router.post(
  '/refund/:refundId',
  auth,
  role('admin'),
  asyncHandler(paymentService.triggerRefund)
);
// see payment history for a buyer
router.get(
  '/my',
  auth,
  role('buyer'),
  asyncHandler(paymentService.getPaymentHistory)
);
router.get(
  '/order/:orderId',
  auth,
  role('buyer', 'admin', 'vendor'),
  asyncHandler(paymentService.getPaymentHistoryById)
);

export { router as paymentRoutes };