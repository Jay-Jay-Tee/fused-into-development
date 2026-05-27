import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
        index: true,
    },
    code: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 },
    },
});

export const Otp = mongoose.model('Otp', otpSchema);
