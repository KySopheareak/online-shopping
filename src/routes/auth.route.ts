import passport from "passport";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { generateOTP } from "../models/utils/generateOtp";
import { sendOTPEmail } from "../models/utils/mail";

dotenv.config();

interface OtpRecord {
    otp: string;
    expiresAt: number;
    user: any;
}

const otpStore: { [email: string]: OtpRecord } = {};

export default [
    // 1. Redirect to Google
    {
        method: "get",
        path: "/google",
        handler: passport.authenticate("google", { scope: ["profile", "email"] })
    },

    // 2. Google callback
    {
        method: "get",
        path: "/google/callback",
        handler: [
            passport.authenticate("google", {
                failureRedirect: `${process.env.FRONTEND_URL}/auth/error?message=Authentication failed`,
            }),
            async (req: any, res: any) => {
                const user = req.user;
                if (!user) {
                    return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=Authentication failed`);
                }

                const otp = generateOTP();
                const expiresAt = Date.now() + 5 * 60 * 1000;

                otpStore[user.email] = { otp, expiresAt, user };
                await sendOTPEmail(user.email, otp);

                res.redirect(`${process.env.FRONTEND_URL}/authentication/verify-otp?email=${user.email}`);
            },
        ],
    },

    // 3. Verify OTP
    {
        method: "post",
        path: "/verify-otp",
        handler: async (req: any, res: any) => {
            const { email, otp } = req.body;
            const record = otpStore[email];

            if (!record) return res.status(400).json({ message: "OTP not found." });
            if (record.otp !== otp) return res.status(401).json({ message: "Invalid OTP." });
            if (Date.now() > record.expiresAt) return res.status(410).json({ message: "OTP expired." });

            // All good — create JWT
            const { user } = record;

            const token = jwt.sign(
                { id: user._id, email: user.email, type: user.type, username: user.username },
                process.env.JWT_SECRET!,
                { expiresIn: "8h" }
            );

            delete otpStore[email];

            res.status(200).json({ message: "OTP verified", token });
        },
    },

    // 4. Resend OTP
    {
        method: "post",
        path: "/resend-otp",
        handler: async (req: any, res: any) => {
            const { email } = req.body;
            const record = otpStore[email];

            if (!record) return res.status(400).json({ message: "No OTP found." });

            const otp = generateOTP();
            const expiresAt = Date.now() + 5 * 60 * 1000;

            otpStore[email] = { otp, expiresAt, user: record.user };
            await sendOTPEmail(email, otp);

            res.status(200).json({ message: "New OTP sent." });
        },
    }
];
