import express from 'express';
const router = express.Router();

import { paymentController } from '../controller/paymentController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { auth } from '../middleware/auth.js';
import { role } from '../middleware/role.js';

// ----- PUBLIC ROUTES (no auth required) ------------------
router.post('/webhook', asyncHandler(paymentController.handleWebhook));

// ----- PROTECTED ROUTES -----------------------------------

// do payment for a product as a buyer
router.post(
  '/create-order',
  auth,
  role("buyer", "vendor"),
  asyncHandler(paymentController.createOrder)
);
router.post(
  '/verify',
  auth,
  role("buyer", "vendor"),
  asyncHandler(paymentController.verifyPayment)
);
router.post(
  '/refund/:refundId',
  auth,
  role('admin'),
  asyncHandler(paymentController.triggerRefund)
);
// see payment history for a buyer
router.get(
  '/my',
  auth,
  role("buyer", "vendor"),
  asyncHandler(paymentController.getPaymentHistory)
);
router.get(
  '/order/:orderId',
  auth,
  role('buyer', 'admin', 'vendor'),
  asyncHandler(paymentController.getPaymentHistoryById)
);
router.post(
  '/upi/:orderId',
  auth,
  role("buyer", "vendor"),
  asyncHandler(paymentController.payUPI)
);

router.post(
  '/upi/:orderId/submit',
  auth,
  role('buyer', 'vendor'),
  asyncHandler(paymentController.submitUPITransaction)
);

router.patch(
  '/upi/:paymentId/approve',
  auth,
  role('admin'),
  asyncHandler(paymentController.approveUPIPayment)
);

export { router as paymentRoutes };