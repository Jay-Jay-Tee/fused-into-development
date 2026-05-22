import express from 'express';
const router = express.Router();

import { productController } from '../controllers/productController.js';
import { asyncHandler }      from '../middleware/asyncHandler.js';
import { auth }              from '../middleware/auth.js';
import { role }              from '../middleware/role.js';

// ─── PUBLIC ROUTES (no auth required) ────────────────────────

// get all products
router.get('/', asyncHandler(productController.getProducts));
// get product by id
router.get('/:id', asyncHandler(productController.getProductById));

// ─── PROTECTED ROUTES ─────────────────

// add product
router.post(
  '/',
  auth,                       
  role('seller'),             
  asyncHandler(productController.createProduct)
);
// update product by id
router.put(
  '/:id',
  auth,
  role('seller'),
  asyncHandler(productController.updateProduct)
);
// delete product by id
router.delete(
  '/:id',
  auth,
  role('seller'),
  asyncHandler(productController.deleteProduct)
);

export { router as productRoutes };