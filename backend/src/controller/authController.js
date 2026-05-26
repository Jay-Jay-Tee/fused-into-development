import { loginService, logoutService, refreshTokenService, registerService } from "../services/authService.js";
import { AppError } from "../utils/appError.js";

const register = async (req, res) => {
    const { name, userName, email, phone, password } = req.body;
    if (!name || !userName || !email || !password)
        throw new AppError("Insufficient auth info", 400);
    const data = await registerService({ name, userName, email, phone, password });
    return res.status(201).json(data);
};

const refreshToken = async (req, res) => {
    const data = await refreshTokenService(req.body);
    return res.status(200).json(data);
};

const login = async (req, res) => {
        const data = await loginService(req.body);
    return res.status(200).json(data);
};

const logout = (req, res) => {
    const data = logoutService({ refreshToken: req.body.refreshToken });
    return res.status(200).json(data);
};

export const authController = {
    register,
    refreshToken,
    login,
    logout,
};