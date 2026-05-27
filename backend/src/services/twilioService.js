import twilio from "twilio";
import { AppError } from "../utils/appError.js";

/*
 * Twilio SMS service helper
 * NOTE: SMS sending is currently disabled by default to avoid trial-account
 * errors in development. To enable SMS, set `SMS_ENABLED=true` in the backend
 * environment and provide valid `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and
 * `TWILIO_VERIFY_SERVICE_SID` values.
 */

const SMS_ENABLED = process.env.SMS_ENABLED === 'true';

const client = SMS_ENABLED ? twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
) : null;
const SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID;

// 10-digit Indian numbers -> E.164
const toE164 = (phone) => {
    if (phone.startsWith("+")) return phone;
    return `+91${phone}`;
};

export const sendOtp = async (to, channel) => {
    if (!SMS_ENABLED) {
        console.warn("SMS sending is disabled (SMS_ENABLED != 'true'). Skipping sendOtp.");
        return;
    }

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
    if (!SMS_ENABLED) {
        console.warn("SMS checking is disabled (SMS_ENABLED != 'true'). Returning false from checkOtp.");
        return false;
    }

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
