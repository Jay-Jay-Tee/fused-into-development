import express from 'express';
const router = express.Router();

import { aiController }      from '../controller/aiController.js';
import { asyncHandler }      from '../middleware/asyncHandler.js';
import { auth }              from '../middleware/auth.js';
import { role }              from '../middleware/role.js';

// ----- PUBLIC ROUTES (no auth required) ------------------

router.post('/search', asyncHandler(aiController.expandSearch))

// ----- PROTECTED ROUTES -----------------------------------

router.post(
    '/recommendations',
    auth,
    role("buyer"),
    asyncHandler(aiController.getRecommendations)
)

router.post(
    '/price-suggest',
    auth,
    role("vendor"),
    asyncHandler(aiController.suggestProductPrice)
)

export { router as aiRoutes };