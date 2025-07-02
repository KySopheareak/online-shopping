import passport from "passport";
import jwt, { decode } from "jsonwebtoken";
import dotenv from "dotenv";
import response from "../utils/ResponseUtil";

dotenv.config();
export default [
    // 1. Redirect to Google
    {
        method: "get",
        path: "/google",
        handler: passport.authenticate("google", { scope: ["profile", "email"] })
    },

    // 2. Google Callback → create JWT and redirect or respond
    {
        method: "get",
        path: "/google/callback",
        handler: [
            passport.authenticate("google", { failureRedirect: `${process.env.FRONTEND_URL}/auth/error?message=Authentication failed` }),
            (req: any, res: any) => {
                const user = req.user;
                if (!user) {
                    return res.redirect(`${process.env.FRONTEND_URL}/auth/error?message=Authentication failed`);
                }

                const token = jwt.sign(
                    { id: user._id, email: user.email, type: user.type, username: user.username },
                    process.env.JWT_SECRET!,
                    { expiresIn: '8h' }
                );

                res.redirect(`${process.env.FRONTEND_URL}/authentication/verify-login?token=${token}`);
            }
        ]
    }
];
