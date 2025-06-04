import { Schema, model, Document } from "mongoose";

export interface OrderProduct {
  product: Schema.Types.ObjectId;
  quantity: number;
}

export interface Order extends Document {
  user: Schema.Types.ObjectId;
  order_date: Date;
  status: string;
  products: OrderProduct[];
  total_amount?: number;
}

const OrderProductSchema = new Schema<OrderProduct>({
  product: { type: Schema.Types.ObjectId, ref: "products", required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const OrderSchema = new Schema<Order>({
  user: { type: Schema.Types.ObjectId, ref: "users", required: true },
  order_date: { type: Date, required: true, default: Date.now },
  status: { type: String, enum: ["paid", "unpaid", "cancelled"], default: "unpaid" },
  products: { type: [OrderProductSchema], required: true },
  total_amount: { type: Number, required: false, default: 0 },
});

export default model<Order>("orders", OrderSchema);