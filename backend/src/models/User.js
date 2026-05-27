import mongoose from 'mongoose';
import validator from 'validator';

import { addressSchema } from './Address.js';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter your name'],
            match: [/^[a-zA-Z ]+$/, 'Name contains special characters or numbers']

        },
        userName: {
            type: String,
            required: true,
            unique: true,
            match: [/^[a-zA-Z0-9\_]+$/, 'Name contains special characters or numbers']
        },
        email: {
            type: String,
            required: [true, 'Please enter your email'],
            unique: true,
            validate: [validator.isEmail, 'email is not valid'],
            lowercase: true,
            trim: true
        },
        // stores hashed password, never plaintext
        password: {
            type: String,
            required: [true, 'password is required'],
            select: false
        },
        role: {
            type: String,
            enum: ['buyer', 'admin', 'vendor', 'delivery'],
            required: [true, 'Please select a role'],
            default: 'buyer'
        },
        phone: {
            type: String,
            required: true,
            match: [/^\d{10}$/, 'Phone number must be 10 digits'],
            unique: true,
            sparse: true
        },
        addresses: [addressSchema],

        vendorApplication: {
            status: { type: String, enum: ['none', 'approved', 'pending', 'rejected'], default: 'none' },
            rejectionNote: { type: String, default: null }
        },

        isBanned: {
            type: Boolean,
            default: false
        }
    },

    {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema);

export { User };