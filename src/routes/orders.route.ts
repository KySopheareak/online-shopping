import { Request, Response } from "express";
import response from "../utils/ResponseUtil";
import OrderModel from "../models/orders.model";
import ProductModel from "../models/products.model";

export default [
  {
    path: "/order",
    method: "post",
    handler: async (req: Request, res: Response) => {
      try {
        const { user, products } = req.body;
        // products should be an array: [{ product: productId, quantity: number }, ...]
        if (!user || !Array.isArray(products) || products.length === 0) {
          return response.fail(
            res,
            400,
            "User and products are required",
            null
          );
        }

        // Validate all products and calculate total_amount
        let total_amount = 0;
        for (const item of products) {
          if (!item.product || !item.quantity || item.quantity < 1) {
            return response.fail(
              res,
              400,
              "Each product must have a valid product ID and quantity",
              null
            );
          }
          const productData = await ProductModel.findById(item.product);
          if (!productData) {
            return response.fail(
              res,
              404,
              `Product not found: ${item.product}`,
              null
            );
          }
          total_amount += productData.price * item.quantity;
        }

        const order = await OrderModel.create({
          user,
          products,
          total_amount,
        });

        response.success(res, order, "Order successfully");
      } catch (error) {
        res.status(500).json({ message: "Internal server error" });
      }
    },
  },
  {
    path: "/order/:id/pay-scan",
    method: "get",
    handler: async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const order = await OrderModel.findById(id);
        if (!order) {
          return response.fail(res, 404, "Order not found", null);
        }
        if (order.status === "paid") {
          return response.fail(res, 400, "Order is already paid", null);
        }

        order.status = "paid";
        await order.save();
        response.success(res, order, "Order marked as paid via scan.");
      } catch (error) {
        res.status(500).send("Internal server error");
      }
    },
  },
  {
    path: "/order/:id/status",
    method: "get",
    handler: async (req: Request, res: Response) => {
      try {
        const order = await OrderModel.findById(req.params.id);
        if (!order) return res.status(404).json({ status: "not_found" });
        res.json({ status: order.status });
      } catch (err) {
        console.error(err);
        res.status(500).json({ status: "error" });
      }
    },
  },
];
