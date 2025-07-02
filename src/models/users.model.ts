import { Document, model, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
    googleId?: string;
    username: string;
    email: string;
    password: string;
    type: string;
    createdAt: Date;
    comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
    googleId: { type: String, unique: true, sparse: true },
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { 
        type: String, 
        required: function(this: IUser) {
            return !this.googleId;
        }
    },
    type: { type: String, enum: ["admin", "client"], default: "admin" },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare password
UserSchema.methods.comparePassword = function (candidate: string) {
    return bcrypt.compare(candidate, this.password);
};

export default model<IUser>("users", UserSchema);