import jwt from 'jsonwebtoken';
import { AppError } from "../utils/appError.js"

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        const err = new AppError('No token provided, authorization denied', 401);
        return next(err);
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id:   decoded.userId,
            role: decoded.role
        };

        next();
    } catch {
        const error = new AppError('Token is invalid or expired', 401);
        return next(error);
    }
};

export { auth };