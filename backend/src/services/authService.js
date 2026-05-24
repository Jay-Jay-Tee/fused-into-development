import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";

// ---- registerService --------------------------

// Addresses are not collected at registration — added later via profile
export const registerService = async ({ name, userName, email, phone, password }) => {
    const existingEmail    = await User.findOne({ email });
    const existingUserName = await User.findOne({ userName });
    const existingPhone    = await User.findOne({ phone });

    if (existingEmail)    throw Object.assign(new Error("Email already in use"), { statusCode: 409 });
    if (existingUserName) throw Object.assign(new Error("Username already taken"), { statusCode: 409 });
    if (existingPhone)    throw Object.assign(new Error("Phone number already in use"), { statusCode: 409 });

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
        throw new Error("Email or username is required");
    }

    // $or requires an array of condition objects, not raw values.
    const query = email ? { email } : { userName };
    
    // select('+password') is needed because password has `select: false` on the schema
    // it's excluded from all queries by default for security.
    const user = await User.findOne(query).select("+password");

    if (!user) {
        throw new Error("No account found with those credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Incorrect username / pasword");
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

// ---- refreshTokenService ---------------------------------
// The refresh token is NOT rotated — same one stays valid for 7 days
export const refreshTokenService = async ({ refreshToken }) => {
    if (!refreshToken) {
        throw Object.assign(new Error("Refresh token is required"), { statusCode: 400 });
    }

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
        throw Object.assign(new Error("Refresh token is invalid or expired"), { statusCode: 401 });
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