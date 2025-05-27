import { Request, Response } from "express";
import UserModel from "../models/users.model";
import jwt from "jsonwebtoken";
import { authenticateJWT } from "../middleware/jwt-handler";

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret";

export default [
  // User Registration
  {
    path: "/user/register",
    method: "post",
    handler: async (req: Request, res: Response) => {
      try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
          return res.status(400).json({ message: "All fields are required" });
        }
        const existing = await UserModel.findOne({
          $or: [{ username }, { email }],
        });
        if (existing) {
          return res.status(409).json({ message: "Username or email already exists" });
        }
        const user = await UserModel.create({ username, email, password });
        const token = jwt.sign(
          { id: user._id, username: user.username },
          JWT_SECRET,
          { expiresIn: "1d" }
        );
        res.status(201).json({
            message: "User registered",
            data: {
              token,
              user: { id: user._id, username, email },
            }
          });
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
          return res
            .status(400)
            .json({ message: "Username and password required" });
        }
        const user = await UserModel.findOne({ username });
        if (!user) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        // Generate JWT token
        const token = jwt.sign(
          { id: user._id, username: user.username },
          JWT_SECRET,
          { expiresIn: "1d" }
        );
        res.json({
          message: "Login successful",
          data: {
            token,
            user: { id: user._id, username: user.username, email: user.email }, 
          },
        });
      } catch (error) {
        res.status(500).json({ message: "Internal server error" });
      }
    },
  },

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
];
