import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { adminRoutes }   from './routes/admin.routes.js';
import { authRoutes }    from './routes/auth.routes.js';
import { orderRoutes }   from './routes/order.routes.js';
import { paymentRoutes } from './routes/payment.routes.js';
import { productRoutes } from './routes/product.routes.js';
import { refundRoutes }  from './routes/refund.routes.js';
import { reviewRoutes }  from './routes/review.routes.js';
import { vendorRoutes }  from './routes/vendor.routes.js';

import { errorHandler }  from './middleware/error.js';

const app = express();

// ─── GLOBAL MIDDLEWARE ───────────────────────────────────────
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173'    // for testing, 5173
}));

app.use(express.json());
// helpful for debugging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// ─── ROUTES ──────────────────────────────────────────────────

app.use('/api/admin',    adminRoutes);
app.use('/api/auth',     authRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/refunds',  refundRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/vendors',  vendorRoutes);

// ─── 404 HANDLER ─────────────────────────────────────────────

app.use((req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

// ─── GLOBAL ERROR HANDLER ────────────────────────────────────

app.use(errorHandler);

module.exports = app;