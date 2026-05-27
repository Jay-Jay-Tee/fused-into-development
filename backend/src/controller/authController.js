import {
    loginService,
    logoutService,
    refreshTokenService,
    registerService,
    verifyRegistrationService,
    resendRegistrationOtpService,
    verifyLogin2FAService,
    toggle2FAService,
} from "../services/authService.js";
import { AppError } from "../utils/appError.js";

const register = async (req, res) => {
    const { name, userName, email, phone, password } = req.body;
    if (!name || !userName || !email || !phone || !password)
        throw new AppError("Name, username, email, phone and password are required", 400);
    const data = await registerService({ name, userName, email, phone, password });
    return res.status(201).json(data);
};

const verifyRegistration = async (req, res) => {
    const { userId, emailCode, phoneCode } = req.body;
    if (!userId || !emailCode || !phoneCode)
        throw new AppError("userId, emailCode and phoneCode are required", 400);
    const data = await verifyRegistrationService({ userId, emailCode, phoneCode });
    return res.status(200).json(data);
};

const resendRegistrationOtp = async (req, res) => {
    const { userId } = req.body;
    if (!userId) throw new AppError("userId is required", 400);
    const data = await resendRegistrationOtpService({ userId });
    return res.status(200).json(data);
};

const login = async (req, res) => {
    const data = await loginService(req.body);
    return res.status(200).json(data);
};

const verifyLogin2FA = async (req, res) => {
    const { twoFactorToken, code } = req.body;
    const data = await verifyLogin2FAService({ twoFactorToken, code });
    return res.status(200).json(data);
};

const toggle2FA = async (req, res) => {
    const data = await toggle2FAService({ userId: req.user.id });
    return res.status(200).json(data);
};

const refreshToken = async (req, res) => {
    const data = await refreshTokenService(req.body);
    return res.status(200).json(data);
};

const logout = async (req, res) => {
    const data = await logoutService({ refreshToken: req.body.refreshToken });
    return res.status(200).json(data);
};

export const authController = {
    register,
    verifyRegistration,
    resendRegistrationOtp,
    login,
    verifyLogin2FA,
    toggle2FA,
    refreshToken,
    logout,
};
