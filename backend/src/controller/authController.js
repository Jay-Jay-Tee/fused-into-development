import { loginService, refreshTokenService, registerService } from "../services/authService.js";
import { AppError } from "../utils/appError.js";

const register = async (req, res) => {
    const { name, email, phone, password } = req.body;
    let { userName } = req.body;
    if (!name || !email || !password)
        throw new AppError("Insufficient auth info", 400);
    if (!userName) {
        userName = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') + '_' + Date.now().toString(36);
    }
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

export const authController = {
    register,
    refreshToken,
    login
};