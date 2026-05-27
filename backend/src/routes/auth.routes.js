import express from 'express';
import rateLimit from 'express-rate-limit';
const router = express.Router();

import { authController }    from '../controller/authController.js';
import { asyncHandler }      from '../middleware/asyncHandler.js';
import { auth }              from '../middleware/auth.js';

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: { message: "Too many OTP requests, please wait before trying again" },
    standardHeaders: true,
    legacyHeaders: false,
});

// ----- PUBLIC ROUTES (no auth required) ------------------

router.post("/register",                   authLimiter, asyncHandler(authController.register));
router.post("/register/verify-otp",        otpLimiter,  asyncHandler(authController.verifyRegistration));
router.post("/register/resend-otp",        otpLimiter,  asyncHandler(authController.resendRegistrationOtp));
router.post("/login",                      authLimiter, asyncHandler(authController.login));
router.post("/login/verify-2fa",           otpLimiter,  asyncHandler(authController.verifyLogin2FA));
router.post("/refresh-token",              asyncHandler(authController.refreshToken));
router.post("/logout",                     asyncHandler(authController.logout));

// ----- PROTECTED ROUTES -----------------------------------

router.put("/2fa/toggle",                  auth, asyncHandler(authController.toggle2FA));

export { router as authRoutes };
