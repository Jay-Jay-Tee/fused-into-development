import express from 'express';
const router = express.Router();

import { productController } from '../controller/productController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { auth } from '../middleware/auth.js';
import { role } from '../middleware/role.js';
import { uploadMultiple } from '../middleware/upload.js';

// ----- PROTECTED ROUTES -----------------------------------
router.get(
  '/my',
  auth,
  role('vendor'),
  asyncHandler(productController.getMyProducts)
);

// ----- PUBLIC ROUTES (no auth required) ------------------
router.get('/', asyncHandler(productController.getProducts));
router.get('/:id', asyncHandler(productController.getProductById));

// ----- PROTECTED ROUTES -----------------------------------


router.post(
  '/',
  auth,
  role('vendor'),
  asyncHandler(productController.resolveProductFolder),
  uploadMultiple,
  asyncHandler(productController.createProduct)
);

router.put(
  '/:id',
  auth,
  role('vendor'),
  asyncHandler(productController.resolveProductFolder),
  uploadMultiple,
  asyncHandler(productController.updateProduct)
);

router.delete(
  '/:id',
  auth,
  role('vendor'),
  asyncHandler(productController.deleteProduct)
);

export { router as productRoutes };