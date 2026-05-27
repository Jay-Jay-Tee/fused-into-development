import dotenv from 'dotenv';
dotenv.config();

import { app } from './app.js';
import { connectDB } from './config/db.js';
import { startReservationCleanupLoop } from './utils/paymentReservation.js';

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
  startReservationCleanupLoop();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (err) {
  console.error('Failed to connect to MongoDB:', err.message);
  process.exit(1);
}
