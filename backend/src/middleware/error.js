const errorHandler = (err, req, res, next) => {

    if (err.name === 'CastError') {
        err.message   = `Resource not found`;
        err.statusCode = 404;
    }

    if (err.name === 'ValidationError') {
        err.message = Object.values(err.errors)
            .map(e => e.message)
            .join(', ');
        err.statusCode = 400;
    }

    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        err.message    = `${field} already exists`;
        err.statusCode = 409; // 409 Conflict
    }

    const statusCode = err.statusCode || 500;

// Send the response ------------------
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',

        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export { errorHandler };