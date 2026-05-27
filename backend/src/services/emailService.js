import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import { Otp } from '../models/Otp.js';
import { AppError } from '../utils/appError.js';

let transporter;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT, 10),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    return transporter;
};

export const sendEmailOtp = async (email, { identifier = email, subject = 'Your VendorHub verification code', intro = 'Your verification code is:' } = {}) => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const hashed = await bcrypt.hash(code, 10);

    await Otp.deleteMany({ identifier });
    await Otp.create({
        identifier,
        code: hashed,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    try {
        await getTransporter().sendMail({
            from: `"VendorHub" <${process.env.SMTP_USER}>`,
            to: email,
            subject,
            text: `${intro} ${code}\n\nThis code expires in 10 minutes.`,
            html: `<p>${intro} <strong style="font-size:24px;letter-spacing:4px">${code}</strong></p><p>This code expires in 10 minutes. Do not share it with anyone.</p>`,
        });
    } catch (err) {
        await Otp.deleteMany({ identifier }).catch(() => {});
        throw new AppError(`Failed to send email: ${err.message}`, 502);
    }
};

export const checkEmailOtp = async (email, code, identifier = email) => {
    const record = await Otp.findOne({ identifier });
    if (!record) return false;

    const match = await bcrypt.compare(code, record.code);
    if (match) {
        await Otp.deleteOne({ _id: record._id });
    }
    return match;
};
