import bcrypt from 'bcrypt';

import { User } from '../models/User.js';
import { AppError } from '../utils/appError.js';

export const getCurrentUserService = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return { user };
};

export const updateProfileService = async (userId, body) => {
    const { name, email, phone } = body;
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    if (email && email !== user.email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            throw new AppError('Email already in use', 400);
        }
        user.email = email;
    }
    if (phone && phone !== user.phone) {
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            throw new AppError('Phone number already in use', 400);
        }
        user.phone = phone;
    }
    if (name) {
        user.name = name;
    }
    await user.save();
    return {
        message: 'Profile updated successfully',
        user
    };
};

export const changePasswordService = async (userId, body) => {
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
        throw new AppError('Current password and new password are required', 400);
    }
    const user = await User.findById(userId).select('+password');
    if (!user) {
        throw new AppError('User not found', 404);
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new AppError('Current password is incorrect', 401);
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return {
        message: 'Password updated successfully'
    };
};

export const addAddressService = async (userId, body) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    user.addresses.push(body);
    await user.save();
    return {
        message: 'Address added successfully',
        addresses: user.addresses
    };
};

export const updateAddressService = async (userId, index, body) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    const addressIndex = Number(index);
    if (
        Number.isNaN(addressIndex) ||
        addressIndex < 0 ||
        addressIndex >= user.addresses.length
    ) {
        throw new AppError('Address not found', 404);
    }
    user.addresses[addressIndex] = {
        ...user.addresses[addressIndex].toObject(),
        ...body
    };
    await user.save();
    return {
        message: 'Address updated successfully',
        addresses: user.addresses
    };
};

export const deleteAddressService = async (userId, index) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    const addressIndex = Number(index);
    if (
        Number.isNaN(addressIndex) ||
        addressIndex < 0 ||
        addressIndex >= user.addresses.length
    ) {
        throw new AppError('Address not found', 404);
    }
    user.addresses.splice(addressIndex, 1);
    await user.save();
    return {
        message: 'Address deleted successfully',
        addresses: user.addresses
    };
};