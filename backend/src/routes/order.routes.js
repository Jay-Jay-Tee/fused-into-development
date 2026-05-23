import express from 'express';
const router = express.Router();

import { orderService }      from '../services/orderService.js';
import { asyncHandler }      from '../middleware/asyncHandler.js';
import { auth }              from '../middleware/auth.js';
import { role }              from '../middleware/role.js';

// ----- PUBLIC ROUTES (no auth required) ------------------

// ----- PROTECTED ROUTES -----------------------------------

router.post(
    '/',
    auth,
    role(["buyer"]),
    asyncHandler(orderService.createOrder)
)

router.get(
    '/my',
    auth,
    role(["buyer"]),
    asyncHandler(orderService.getMyOrders)
)

router.get(
    '/vendor',
    auth,
    role(["vendor"]),
    asyncHandler(orderService.getVendorOrders)
)

router.get(
    '/:id',
    auth,
    role(["buyer", "vendor"]),
    asyncHandler(orderService.getOrderById)
)

router.put(
    '/:id/status',
    auth,
    role(["vendor"]),
    asyncHandler(orderService.updateOrderStatus)
)

export { router as orderRoutes };