import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { sendOtp, checkOtp } from "./twilioService.js";
import { sendEmailOtp, checkEmailOtp } from "./emailService.js";
import { RevokedToken } from "../models/RevokedToken.js";

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
        role: "buyer",
        isEmailVerified: false,
        isPhoneVerified: false,
    });

    await sendEmailOtp(email);
    await sendOtp(phone, "sms");

    return {
        message: "Verification codes sent to your email and phone",
        userId: user._id,
        requiresVerification: true,
    };
};

// ---- verifyRegistrationService ----------------
export const verifyRegistrationService = async ({ userId, emailCode, phoneCode }) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    if (user.isEmailVerified && user.isPhoneVerified) {
        throw new AppError("Account is already verified", 400);
    }

    const emailOk = await checkEmailOtp(user.email, emailCode);
    if (!emailOk) throw new AppError("Invalid email verification code", 400);

    const phoneOk = await checkOtp(user.phone, "sms", phoneCode);
    if (!phoneOk) throw new AppError("Invalid phone verification code", 400);

    user.isEmailVerified = true;
    user.isPhoneVerified = true;
    await user.save();

    return { message: "Account verified successfully" };
};

// ---- resendRegistrationOtpService -------------
export const resendRegistrationOtpService = async ({ userId }) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    if (user.isEmailVerified && user.isPhoneVerified) {
        throw new AppError("Account is already verified", 400);
    }

    await sendEmailOtp(user.email);
    await sendOtp(user.phone, "sms");

    return { message: "Verification codes resent" };
};

// ---- loginService ----------------------------------
export const loginService = async ({ email, userName, phone, password }) => {
    if (!email && !userName && !phone) {
        throw new AppError("Email, username or phone is required", 401);
    }

    const query = email ? { email } : phone ? { phone } : { userName };

    const user = await User.findOne(query).select("+password");

    if (!user) {
        throw new AppError("No account found with those credentials", 401);
    }

    if (!user.isEmailVerified) {
        throw new AppError("Please verify your account before logging in", 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError("Incorrect password", 401);
    }

    if (user.twoFactorEnabled && user.role !== 'admin') {
        let otpTo, otpChannel;
        if (email) {
            otpTo = user.email;
            otpChannel = "email";
        } else if (phone) {
            otpTo = user.phone;
            otpChannel = "sms";
        } else {
            otpTo = user.email;
            otpChannel = "email";
        }

        if (otpChannel === "email") {
            await sendEmailOtp(otpTo);
        } else {
            await sendOtp(otpTo, "sms");
        }

        const twoFactorToken = jwt.sign(
            { userId: user._id, to: otpTo, channel: otpChannel, purpose: "2fa-login" },
            process.env.JWT_2FA_SECRET,
            { expiresIn: "10m" }
        );

        return { twoFactorRequired: true, twoFactorToken };
    }

    const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
};

// ---- verifyLogin2FAService ---------------------
export const verifyLogin2FAService = async ({ twoFactorToken, code }) => {
    if (!twoFactorToken || !code) {
        throw new AppError("Token and code are required", 400);
    }

    let decoded;
    try {
        decoded = jwt.verify(twoFactorToken, process.env.JWT_2FA_SECRET);
    } catch {
        throw new AppError("2FA token is invalid or expired", 401);
    }

    if (decoded.purpose !== "2fa-login") {
        throw new AppError("Invalid token", 401);
    }

    const approved = decoded.channel === "email"
        ? await checkEmailOtp(decoded.to, code)
        : await checkOtp(decoded.to, "sms", code);
    if (!approved) throw new AppError("Invalid verification code", 401);

    const user = await User.findById(decoded.userId);
    if (!user) throw new AppError("User not found", 404);

    const accessToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
};

// ---- toggle2FAService --------------------------
export const toggle2FAService = async ({ userId }) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    user.twoFactorEnabled = !user.twoFactorEnabled;
    await user.save();

    return {
        twoFactorEnabled: user.twoFactorEnabled,
        message: `Two-factor authentication ${user.twoFactorEnabled ? "enabled" : "disabled"}`,
    };
};

// ---- logoutService ---------------------------------
export const logoutService = async ({ refreshToken }) => {
    if (!refreshToken) throw new AppError("Refresh token is required", 400);

    const decoded = jwt.decode(refreshToken);
    const expiresAt = decoded?.exp
        ? new Date(decoded.exp * 1000)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await RevokedToken.create({ token: refreshToken, expiresAt }).catch(() => {});
    return { message: "Logged out successfully" };
};

// ---- refreshTokenService ---------------------------------
export const refreshTokenService = async ({ refreshToken }) => {
    if (!refreshToken) {
        throw new AppError("Refresh token is required", 400);
    }

    const isRevoked = await RevokedToken.exists({ token: refreshToken });
    if (isRevoked) {
        throw new AppError("Refresh token has been revoked", 401);
    }

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
        throw new AppError("Refresh token is invalid or expired", 401);
    }

    const accessToken = jwt.sign(
        { userId: decoded.userId, role: decoded.role },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );

    return { accessToken };
};
