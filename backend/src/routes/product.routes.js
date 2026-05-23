import express from 'express';
const router = express.Router();

import { productService }    from '../services/productService.js';
import { asyncHandler }      from '../middleware/asyncHandler.js';
import { auth }              from '../middleware/auth.js';
import { role }              from '../middleware/role.js';

// ----- PUBLIC ROUTES (no auth required) ------------------

// get all products
router.get('/', asyncHandler(productService.getProducts));
// get product by id
router.get('/:id', asyncHandler(productService.getProductById));

// ----- PROTECTED ROUTES -----------------------------------

// add product
router.post(
  '/',
  auth,                       
  role('seller'),             
  asyncHandler(productService.createProduct)
);
// update product by id
router.put(
  '/:id',
  auth,
  role('seller'),
  asyncHandler(productService.updateProduct)
);
// delete product by id
router.delete(
  '/:id',
  auth,
  role('seller'),
  asyncHandler(productService.deleteProduct)
);

export { router as productRoutes };