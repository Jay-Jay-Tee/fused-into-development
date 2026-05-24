
const role = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            const err = new Error('Authentication required before role check');
            err.statusCodeCode = 401;
            return next(err);
        }

        if (!allowedRoles.includes(req.user.role)) {
            const err = new Error('Access denied');
            err.statusCode = 403;
            err.name = 'ForbiddenError';
            return next(err);
        }
        next();
    }
}

export { role };