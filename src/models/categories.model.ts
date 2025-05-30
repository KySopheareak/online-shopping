import { Schema, model, Document } from "mongoose";

export interface Category extends Document {
    name: string;
}

const CategorySchema = new Schema<Category>({
  name: { type: String, required: true },
});

export default model<Category>("categories", CategorySchema);