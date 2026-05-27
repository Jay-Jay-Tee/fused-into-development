import {
    addAddressService,
    changePasswordService,
    deleteAddressService,
    getCurrentUserService,
    updateAddressService,
    updateProfileService
} from '../services/userService.js';
import { User } from '../models/User.js';

const getCurrentUser = async (req, res) => {
    const data = await getCurrentUserService(req.user.id);
    return res.status(200).json(data);
};

const updateProfile = async (req, res) => {
    const data = await updateProfileService(req.user.id, req.body);
    return res.status(200).json(data);
};

const changePassword = async (req, res) => {
    const data = await changePasswordService(req.user.id, req.body);
    return res.status(200).json(data);
};

const addAddress = async (req, res) => {
    const data = await addAddressService(req.user.id, req.body);
    return res.status(201).json(data);
};

const updateAddress = async (req, res) => {
    const data = await updateAddressService(
        req.user.id,
        req.params.index,
        req.body
    );

    return res.status(200).json(data);
};

const deleteAddress = async (req, res) => {
    const data = await deleteAddressService(req.user.id, req.params.index);
    return res.status(200).json(data);
};

const deleteAccount = async (req, res) => {
    await User.findByIdAndDelete(req.user.id);
    return res.status(200).json({ message: 'Account deleted' });
};

export const userController = {
    getCurrentUser,
    updateProfile,
    changePassword,
    addAddress,
    updateAddress,
    deleteAddress,
    deleteAccount
};
