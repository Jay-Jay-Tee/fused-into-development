import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        const err = new Error('No token provided, authorization denied');
        err.statusCode = 401;
        err.name = 'NoTokenError';
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
        const error = new Error('Token is invalid or expired');
        error.statusCode = 401;
        error.name = 'InvalidTokenError';
        return next(error);
    }
};

export { auth };