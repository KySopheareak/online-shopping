import { Request, Response } from "express";
import Product from "../models/products.model";
import response from "../utils/ResponseUtil";
import { getProductsWithDiscount } from "../controllers/products.controller";
import path from "path";

export default [
  {
    path: "/products",
    method: "post",
    handler: async (req: Request, res: Response) => {
      try {
        const { search, category } = req.body;

        const matchConditions: any[] = [];

        if (category && category.length > 0) {
          matchConditions.push({ category: { $in: category } });
        }
        if (search) {
          matchConditions.push({ title: { $regex: search, $options: "i" } });
        }

        await getProductsWithDiscount(matchConditions, res);
      } catch (err: any) {
        console.error("=====> Error fetching products:", err);
        response.fail(
          res,
          500,
          "Internal Server Error",
          "An error occurred while fetching products"
        );
      }
    },
  },
  {
    path: "/products/:id",
    method: "get",
    handler: async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const product = await Product.findById(id, {
          title: 1,
          description: 1,
          brand: 1,
          discountPercentage: 1,
          price: 1,
          thumbnail: 1,
          discountedPrice: 1,
          finalPrice: 1,
          stock: 1
        }).populate({
            path: "discountPercentage",
            select: "percentage -_id",
          }).lean();

        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }
        if (product.discountPercentage && typeof product.discountPercentage === "object") {
          product.discountPercentage = product.discountPercentage.percentage;
        }
        response.success(res, product, "Product fetched successfully");
      } catch (err: any) {
        res.status(500).json({ error: err.message || "Internal Server Erro!" });
      }
    },
  },
];
