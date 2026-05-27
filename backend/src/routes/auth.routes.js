import express from 'express';
const router = express.Router();

import { authController }    from '../controller/authController.js';
import { asyncHandler }      from '../middleware/asyncHandler.js';
import { auth }              from '../middleware/auth.js';

// ----- PUBLIC ROUTES (no auth required) ------------------

router.post("/register",                   asyncHandler(authController.register));
router.post("/register/verify-otp",        asyncHandler(authController.verifyRegistration));
router.post("/register/resend-otp",        asyncHandler(authController.resendRegistrationOtp));
router.post("/login",                      asyncHandler(authController.login));
router.post("/login/verify-2fa",           asyncHandler(authController.verifyLogin2FA));
router.post("/refresh-token",              asyncHandler(authController.refreshToken));
router.post("/logout",                     asyncHandler(authController.logout));

// ----- PROTECTED ROUTES -----------------------------------

router.put("/2fa/toggle",                  auth, asyncHandler(authController.toggle2FA));

export { router as authRoutes };
