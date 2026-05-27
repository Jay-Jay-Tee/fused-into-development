import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { AppError } from "../utils/appError.js";
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

    try {
        await sendEmailOtp(email);
    } catch (error) {
        await User.deleteOne({ _id: user._id }).catch(() => {});
        throw error;
    }

    return {
        message: "Verification code sent to your email",
        userId: user._id,
        requiresVerification: true,
    };
};

// ---- verifyRegistrationService ----------------
export const verifyRegistrationService = async ({ userId, emailCode }) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    if (user.isEmailVerified) {
        throw new AppError("Account is already verified", 400);
    }

    const emailOk = await checkEmailOtp(user.email, emailCode);
    if (!emailOk) throw new AppError("Invalid email verification code", 400);

    // Mark both email and phone as verified for now since SMS verification is disabled
    user.isEmailVerified = true;
    user.isPhoneVerified = true;
    await user.save();

    return { message: "Account verified successfully" };
};

// ---- resendRegistrationOtpService -------------
export const resendRegistrationOtpService = async ({ userId }) => {
    const user = await User.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    if (user.isEmailVerified) {
        throw new AppError("Account is already verified", 400);
    }

    await sendEmailOtp(user.email);

    return { message: "Verification code resent" };
};

// ---- resendLogin2FAService ----------------------
export const resendLogin2FAService = async ({ twoFactorToken }) => {
    if (!twoFactorToken) {
        throw new AppError("2FA token is required", 400);
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

    // Always resend via email for now
    await sendEmailOtp(decoded.to);

    return { message: "Verification code resent" };
};

// ---- requestPasswordResetService ----------------
export const requestPasswordResetService = async ({ email }) => {
    if (!email) {
        throw new AppError("Email is required", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
        const resetIdentifier = `password-reset:${normalizedEmail}`;
        await sendEmailOtp(normalizedEmail, {
            identifier: resetIdentifier,
            subject: 'Your VendorHub password reset code',
            intro: 'Your password reset code is:',
        });
    }

    return { message: 'If an account exists for that email, a reset code has been sent.' };
};

// ---- confirmPasswordResetService ----------------
export const confirmPasswordResetService = async ({ email, code, newPassword }) => {
    if (!email || !code || !newPassword) {
        throw new AppError("Email, code and new password are required", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const resetIdentifier = `password-reset:${normalizedEmail}`;
    const approved = await checkEmailOtp(normalizedEmail, code, resetIdentifier);
    if (!approved) {
        throw new AppError("Invalid or expired reset code", 400);
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
        throw new AppError("User not found", 404);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: 'Password reset successfully' };
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

    // Verify password first
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError("Incorrect password", 401);
    }

    // If the account exists but hasn't completed registration verification,
    // send the registration OTP via email and instruct the client to show the verification UI.
    if (!user.isEmailVerified) {
        await sendEmailOtp(user.email);
        return {
            requiresVerification: true,
            userId: user._id,
            message: "Account exists but is not verified; verification code sent",
        };
    }

    if (user.twoFactorEnabled && user.role !== 'admin') {

        const otpTo = user.email;
        const otpChannel = "email";
        await sendEmailOtp(otpTo);

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

    // Only email-based 2FA is supported for now
    const approved = await checkEmailOtp(decoded.to, code);
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
