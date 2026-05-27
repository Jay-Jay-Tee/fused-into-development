import twilio from "twilio";
import { AppError } from "../utils/appError.js";

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);
const SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

// 10-digit Indian numbers -> E.164
const toE164 = (phone) => {
    if (phone.startsWith("+")) return phone;
    return `+91${phone}`;
};

export const sendOtp = async (to, channel) => {
    const recipient = channel === "sms" ? toE164(to) : to;
    try {
        await client.verify.v2
            .services(SERVICE_SID)
            .verifications.create({ to: recipient, channel });
    } catch (err) {
        throw new AppError(`Failed to send verification code: ${err.message}`, 502);
    }
};

export const checkOtp = async (to, channel, code) => {
    const recipient = channel === "sms" ? toE164(to) : to;
    try {
        const result = await client.verify.v2
            .services(SERVICE_SID)
            .verificationChecks.create({ to: recipient, code });
        return result.status === "approved";
    } catch {
        return false;
    }
};
