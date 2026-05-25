import { AppError } from "../utils/appError.js";

const role = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            const err = new AppError('Authentication required before role check', 401);
            return next(err);
        }

        if (!allowedRoles.includes(req.user.role)) {
            const err = new AppError('Access denied', 403);
            return next(err);
        }
        next();
    }
}

export { role };