import { Schema, model, Document, Types } from "mongoose";

export interface Discount extends Document {
  product: Types.ObjectId[];
  percentage: number;
  startDate: Date;
  endDate: Date;
  active: boolean;
}

const DiscountSchema = new Schema<Discount>({
  product: { type: [Types.ObjectId], ref: "products", required: true },
  percentage: { type: Number, required: true },
  startDate: { type: Date, default: Date.now, required: true },
  endDate: { type: Date, required: true },
  active: { type: Boolean, required: true },
});

export default model<Discount>("discounts", DiscountSchema);
