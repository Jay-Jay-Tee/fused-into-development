import express from 'express';
const router = express.Router();

import { authController }    from '../controller/authController.js';
import { asyncHandler }      from '../middleware/asyncHandler.js';

// ----- PUBLIC ROUTES (no auth required) ------------------

router.post("/register", asyncHandler(authController.register));
router.post("/login", asyncHandler(authController.login));
router.post("/refresh-token", asyncHandler(authController.refreshToken));
router.post("/logout", asyncHandler(authController.logout));

// ----- PROTECTED ROUTES -----------------------------------


export { router as authRoutes };