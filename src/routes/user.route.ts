import { Request, Response } from "express";
import UserModel from "../models/users.model";
import jwt, { decode } from "jsonwebtoken";
import { authenticateJWT } from "../middleware/jwt-handler";
import response from "../utils/ResponseUtil";
import path from "path";
import { METHODS } from "http";

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret";

export default [
    // User Registration
    {
        path: "/user/register",
        method: "post",
        handler: async (req: Request, res: Response) => {
            try {
                const { username, email, password, type } = req.body;
                if (!username || !email || !password || !type) {
                    return response.fail(res, 400, "All fields are required", null);
                }

                const existing = await UserModel.findOne({
                    $or: [{ username }, { email }],
                });
                if (existing) {
                    return response.fail(res, 409, "Username or email already exists", null);
                }

                const user = await UserModel.create({ username, email, password, type });
                const token = jwt.sign(
                    { id: user._id, username: user.username },
                    JWT_SECRET,
                    { expiresIn: "8h" }
                );
                let finalData: any = {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    type: user.type,
                }
                let data: any = { token, user: finalData }
                response.success(res, data, "User registered successfully");

            } catch (error) {
                res.status(500).json({ message: "Internal server error" });
            }
        },
    },

    // User Login
    {
        path: "/user/login",
        method: "post",
        handler: async (req: Request, res: Response) => {
            try {
                const { username, password } = req.body;
                if (!username || !password) {
                    return res.status(400).json({ message: "Username and password required" });
                }

                const user = await UserModel.findOne({ username });
                if (!user) {
                    return response.fail(res, 401, "Invalid credentials", null);
                }

                const isMatch = await user.comparePassword(password);
                if (!isMatch) {
                    return response.fail(res, 401, "Invalid credentials", null);
                }
                // Generate JWT token

                const token = jwt.sign(
                    { id: user._id, username: user.username },
                    JWT_SECRET,
                    { expiresIn: '8h' }
                );
                let decoded: any = jwt.verify(token, JWT_SECRET);
                const expireTime = decoded.exp;

                let data: any = { token, expireTime, user: { id: user._id, username: user.username, email: user.email } };
                response.success(res, data, "Login successful");

            } catch (error) {
                response.fail(res, 500, "Internal server error", error);
            }
        },
    },

    // User Profile
    {
        path: "/user/profile",
        method: "get",
        middleware: [authenticateJWT],
        handler: async (req: Request, res: Response) => {
            try {
                const user = await UserModel.findById(req.loginUser.id).select(
                    "-password"
                );
                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }
                res.json({ user });
            } catch (error) {
                res.status(500).json({ message: "Internal server error" });
            }
        },
    },

    // User List
    {
        path: "/user/list",
        method: "post",
        handler: async (req: Request, res: Response) => {
            try {
                const { search, page = 1, limit = 10 } = req.body;
                const matchConditions: any[] = [];

                if (search) {
                    matchConditions.push({
                        $or: [
                            { username: { $regex: search, $options: "i" } },
                            { email: { $regex: search, $options: "i" } },
                            { type: { $regex: search, $options: "i" } }
                        ]
                    });
                }

                const totalItems = await UserModel.countDocuments(
                    matchConditions.length ? { $and: matchConditions } : {}
                );

                const aggregatePipeline = [
                    ...(matchConditions.length ? [{ $match: { $and: matchConditions } }] : []),
                    {
                        $project: {
                            _id: 1,
                            type: 1,
                            username: 1,
                            email: 1,
                            createdAt: 1,
                            updatedAt: 1
                        },
                    },
                    { $skip: (Number(page) - 1) * Number(limit) },
                    { $limit: Number(limit) },
                ];

                const users = await UserModel.aggregate(aggregatePipeline);

                const totalPages = Math.ceil(totalItems / Number(limit));

                let pagination: any = {
                    page: Number(page),
                    count: totalPages,
                    total: totalItems,
                }

                response.success(res, {
                    users,
                    pagination
                }, "Users fetched successfully!");

            } catch (err: any) {
                console.error("=====> Error fetching users:", err);
                response.fail(
                    res,
                    500,
                    "Internal Server Error",
                    "An error occurred while fetching users"
                );
            }
        }
    }
];
