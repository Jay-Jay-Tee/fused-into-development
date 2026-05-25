import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { adminRoutes }      from './routes/admin.routes.js';
import { aiRoutes }         from './routes/ai.routes.js';
import { authRoutes }       from './routes/auth.routes.js';
import { categoryRoutes }   from './routes/category.routes.js';
import { orderRoutes }      from './routes/order.routes.js';
import { paymentRoutes }    from './routes/payment.routes.js';
import { productRoutes }    from './routes/product.routes.js';
import { refundRoutes }     from './routes/refund.routes.js';
import { reviewRoutes }     from './routes/review.routes.js';
import { vendorRoutes }     from './routes/vendor.routes.js';
import { cartRoutes }       from './routes/cart.routes.js';
import { wishlistRoutes }   from './routes/wishlist.routes.js';

import { errorHandler }  from './middleware/error.js';
import { AppError } from './utils/appError.js';

const app = express();

// ------ GLOBAL MIDDLEWARE -----------------------------
const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',')
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
}));

app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
// helpful for debugging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// ------------- ROUTES ---------------------------------

app.use('/api/admin',       adminRoutes);
app.use('/api/ai',          aiRoutes);
app.use('/api/auth',        authRoutes);
app.use('/api/categories',  categoryRoutes);
app.use('/api/orders',      orderRoutes);
app.use('/api/payments',    paymentRoutes);
app.use('/api/products',    productRoutes);
app.use('/api/refunds',     refundRoutes);
app.use('/api/reviews',     reviewRoutes);
app.use('/api/vendors',     vendorRoutes);
app.use('/api/cart',        cartRoutes);
app.use('/api/wishlist',    wishlistRoutes);

// ------------ 404 HANDLER -----------------------------

app.use((req, res, next) => {
    const error = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
    next(error);
});

// ----- GLOBAL ERROR HANDLER ---------------------------

app.use(errorHandler);

export { app };