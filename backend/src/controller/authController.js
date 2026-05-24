import { loginService, refreshTokenService, registerService } from "../services/authService.js";

const register = async (req, res) => {
    const { userName, email, password } = req.body;
    if (!email && !userName)
        throw new Error("Insufficient auth info");
    const data = await registerService({ userName, email, password });
    return res.status(200).json(data);
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