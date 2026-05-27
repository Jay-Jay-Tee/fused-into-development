import jwt from 'jsonwebtoken';
import { User } from "../models/User.js";
import { AppError } from "../utils/appError.js"

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return next(new AppError('No token provided, authorization denied', 401));
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return next(new AppError('Token is invalid or expired', 401));
    }

    const user = await User.findById(decoded.userId).select("isBanned role").lean();
    if (!user)           return next(new AppError('User no longer exists', 401));
    if (user.isBanned)   return next(new AppError('Your account has been banned', 403));

    req.user = { id: decoded.userId, role: decoded.role };
    next();
};

export { auth };