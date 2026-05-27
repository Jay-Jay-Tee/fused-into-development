import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { AppError } from "../utils/appError.js";

// ---- registerService --------------------------
export const registerService = async ({ name, userName, email, phone, password }) => {
    const existingEmail    = await User.findOne({ email });
    const existingUserName = await User.findOne({ userName });
    const existingPhone    = await User.findOne({ phone });

    if (existingEmail)    throw new AppError("Email already in use", 400);
    if (existingUserName) throw new AppError("Username already taken", 400);
    if (existingPhone)    throw new AppError("Phone number already in use", 400);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        userName,
        email,
        phone,
        password: hashedPassword,
        role: "buyer",          // always buyer at registration
    });

    return {
        message: "Account created successfully",
        userId: user._id,
    };
};

// ---- loginService ----------------------------------
// Accepts either email or userName alongside password.
// Returns both access token (15m) and refresh token (7d).
export const loginService = async ({ email, userName, password }) => {
    if (!email && !userName) {
        throw new AppError("Email or username is required", 401);
    }

    // $or requires an array of condition objects, not raw values.
    const query = email ? { email } : { userName };
    
    // select('+password') is needed because password has `select: false` on the schema
    // it's excluded from all queries by default for security.
    const user = await User.findOne(query).select("+password");

    if (!user) {
        throw new AppError("No account found with those credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new AppError("Incorrect username / password", 401);
    }

    const accessToken = jwt.sign(
        {
            userId: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        {
            userId: user._id,
            role: user.role
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
};

const revokedTokens = new Set();

// ---- logoutService ---------------------------------
export const logoutService = ({ refreshToken }) => {
    if (!refreshToken) throw new AppError("Refresh token is required", 400);
    revokedTokens.add(refreshToken);
    return { message: "Logged out successfully" };
};

// ---- refreshTokenService ---------------------------------
// The refresh token is NOT rotated, same one stays valid for 7 days
export const refreshTokenService = async ({ refreshToken }) => {
    if (!refreshToken) {
        throw new AppError("Refresh token is required", 400);
    }

    if (revokedTokens.has(refreshToken)) {
        throw new AppError("Refresh token has been revoked", 401);
    }

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
        throw new AppError("Refresh token is invalid or expired", 401);
    }

    const accessToken = jwt.sign(
        {
            userId: decoded.userId,
            role: decoded.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );

    return { accessToken };
};