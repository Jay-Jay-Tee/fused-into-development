import express from 'express';
const router = express.Router();

import { orderController }   from '../controller/orderController.js';
import { asyncHandler }      from '../middleware/asyncHandler.js';
import { auth }              from '../middleware/auth.js';
import { role }              from '../middleware/role.js';

// ----- PUBLIC ROUTES (no auth required) ------------------

// ----- PROTECTED ROUTES -----------------------------------

router.post(
    '/',
    auth,
    role(["buyer"]),
    asyncHandler(orderController.createOrder)
)

router.get(
    '/my',
    auth,
    role(["buyer"]),
    asyncHandler(orderController.getMyOrders)
)

router.get(
    '/vendor',
    auth,
    role(["vendor"]),
    asyncHandler(orderController.getVendorOrders)
)

router.get(
    '/:id',
    auth,
    role(["buyer", "vendor"]),
    asyncHandler(orderController.getOrderById)
)

router.put(
    '/:id/status',
    auth,
    role(["vendor"]),
    asyncHandler(orderController.updateOrderStatus)
)

export { router as orderRoutes };