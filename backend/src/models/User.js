import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

import { addressSchema } from './Address.js';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please enter your name'],
            match: [/^[a-zA-Z ]+$/, 'Name contains special characters or numbers']

        },
        email: {
            type: String,
            required: [true, 'Please enter your email'],
            unique: true,
            validate: [validator.isEmail, 'email is not valid'],
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: [true, 'passsword is required'],
            select: false
        },
        role: {
            type: String,
            enum: ['buyer', 'admin', 'vendor', 'delivery'],
            required: [true, 'Please select a role']
        },
        phone: {
            type: String,
            required: [true, 'Please enter your phone number'],
            match: [/^\d{10}$/, 'Phone number must be 10 digits'],
            unique: true
        },
        addresses: [addressSchema],
        cart: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                }
            }
        ],
        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            }
        ],
        refreshToken: {
            type: String,
            select: false
        }
    },

    {
        timestamps: true
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export { User };