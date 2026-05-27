import express from 'express';
const router = express.Router();

import { userController }   from '../controller/userController.js';
import { asyncHandler }     from '../middleware/asyncHandler.js';
import { auth }             from '../middleware/auth.js';
import { role }             from '../middleware/role.js';

// because its all for buyers, and all vendors are buyers
router.use(
    auth,
    role("buyer", "vendor")
);

router.get(
    '/me',
    asyncHandler(userController.getCurrentUser)
);

router.put(
    '/me',
    asyncHandler(userController.updateProfile)
);

router.put(
    '/me/password',
    asyncHandler(userController.changePassword)
);

router.post(
    '/me/addresses',
    asyncHandler(userController.addAddress)
);

router.put(
    '/me/addresses/:index',
    asyncHandler(userController.updateAddress)
);

router.delete(
    '/me/addresses/:index',
    asyncHandler(userController.deleteAddress)
);

router.delete(
    '/me',
    asyncHandler(userController.deleteAccount)
);

export { router as userRoutes };