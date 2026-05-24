import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';

export const registerService = async ({ userName, email, password }) => {
    const existingUserEmail = await User.findOne({ email });
    const existingUserName = await User.findOne({ userName });

    if (existingUserEmail)
        throw new Error("User already exists with given email");
    if (existingUserName)
        throw new Error("User already exists with given userName");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        email,
        password: hashedPassword
    });

    return {
        message: "User created",
        userId: user._id
    };
};

export const loginService = async ({ email, userName, password }) => {
    const user = await User.findOne({ $or: [email, userName] });
    if (!user)
        throw new Error("User does not exist");

    const isMatch = bcrypt.compare(password, user.password);

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

export const refreshTokenService = async ({ refreshToken }) => {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const accessToken = jwt.sign(
        {
            userId: decoded.userId,
            role: decoded.role
        },
        process.env.JWT_SECRET,
        {expiresIn: "15m"}
    );

    return { accessToken };
};
