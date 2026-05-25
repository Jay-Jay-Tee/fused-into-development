import express from 'express';
const router = express.Router();

import { Newsletter } from '../models/Newsletter.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { AppError } from '../utils/appError.js';

router.post('/', asyncHandler(async (req, res) => {
    const { email, phone } = req.body;

    if (!email && !phone) {
        throw new AppError('Provide an email or phone number', 400);
    }

    const existing = await Newsletter.findOne({
        $or: [
            ...(email ? [{ email }] : []),
            ...(phone ? [{ phone }] : []),
        ],
    });

    if (existing) {
        throw new AppError('Already subscribed', 409);
    }

    await Newsletter.create({ email, phone });

    return res.status(201).json({ message: 'Subscribed successfully' });
}));

export { router as newsletterRoutes };
