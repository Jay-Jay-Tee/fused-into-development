import mongoose from 'mongoose';

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,  // to silence warnings
    useUnifiedTopology: true,
  });
  console.log(`MongoDB connected: ${conn.connection.host}`);    // apparently good practice
};

export { connectDB };