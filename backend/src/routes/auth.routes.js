import express from 'express';
const router = express.Router();

import { authService }      from '../services/authService.js';
import { asyncHandler }      from '../middleware/asyncHandler.js';

// ----- PUBLIC ROUTES (no auth required) ------------------

router.post("/register", asyncHandler(authService.register)); 
router.post("/login", asyncHandler(authService.login));
router.post("/refresh-token", asyncHandler(authService.refreshToken));

// maybe make in V2
// router.post("/logout", asyncHandler(orderService.logout));  

// ----- PROTECTED ROUTES -----------------------------------


export { router as orderRoutes };