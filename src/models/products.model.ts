import mongoose, { Types } from "mongoose";

const reviewSchema = new mongoose.Schema({
  rating: { type: Number, required: true },
  comment: String,
  date: { type: Date, default: Date.now },
  reviewerName: String,
  reviewerEmail: String,
});

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  description: String,
  category: String,
  price: { type: Number, required: true },
  discountPercentage: { type: mongoose.Schema.Types.ObjectId, ref: "discounts", default: null },
  stock: Number,
  tags: [String],
  brand: String,
  reviews: [reviewSchema],
  images: [String],
  thumbnail: String,
  finalPrice: { type: Number, default: 0 },
  discountedPrice: { type: Number, default: 0 },
});

const Product = mongoose.model("products", productSchema);

export default Product;