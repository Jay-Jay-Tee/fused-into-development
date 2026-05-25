import express from 'express';
const router = express.Router();

import { asyncHandler } from '../middleware/asyncHandler.js';
import { getActiveCategoriesService, getSubcategoriesService } from '../services/categoryService.js';

// GET /api/categories
router.get('/', asyncHandler(async (req, res) => {
    const data = await getActiveCategoriesService();
    return res.status(200).json(data);
}));

// GET /api/categories/:id/subcategories
router.get('/:id/subcategories', asyncHandler(async (req, res) => {
    const data = await getSubcategoriesService({ categoryId: req.params.id });
    return res.status(200).json(data);
}));

export { router as categoryRoutes };