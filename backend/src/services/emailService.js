import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import { Otp } from '../models/Otp.js';
import { AppError } from '../utils/appError.js';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmailOtp = async (email) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const hashed = await bcrypt.hash(code, 10);

    await Otp.deleteMany({ identifier: email });
    await Otp.create({
        identifier: email,
        code: hashed,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    try {
        await transporter.sendMail({
            from: `"VendorHub" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Your VendorHub verification code',
            text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`,
            html: `<p>Your verification code is: <strong style="font-size:24px;letter-spacing:4px">${code}</strong></p><p>This code expires in 10 minutes. Do not share it with anyone.</p>`,
        });
    } catch (err) {
        throw new AppError(`Failed to send email: ${err.message}`, 502);
    }
};

export const checkEmailOtp = async (email, code) => {
    const record = await Otp.findOne({ identifier: email });
    if (!record) return false;

    const match = await bcrypt.compare(code, record.code);
    if (match) {
        await Otp.deleteOne({ _id: record._id });
    }
    return match;
};
