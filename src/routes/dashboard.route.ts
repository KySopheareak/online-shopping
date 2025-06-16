import { Request, Response } from "express";
import Product from "../models/products.model";
import Order from "../models/orders.model";
import ResponeUtil from "../utils/ResponseUtil";

export default [
  {
    path: "/dashboard",
    method: "get",
    handler: async (req: Request, res: Response) => {
      try {
        // Parse date filters or default to current month
        const { start_date, end_date } = req.query;
        let startDate: Date, endDate: Date;

        if (start_date && end_date) {
          startDate = new Date(start_date as string);
          endDate = new Date(end_date as string);
          endDate.setHours(23, 59, 59, 999);
        } else {
          const now = new Date();
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        }

        // Aggregate order products within date range
        const orderItems = await Order.aggregate([
          {
            $match: {
              order_date: { $gte: startDate, $lte: endDate },
            },
          },
          { $unwind: "$products" },
          {
            $group: {
              _id: "$products.product", // Assuming 'product' is the ObjectId reference in OrderProduct
              quantitySold: { $sum: "$products.quantity" },
            },
          },
        ]);

        // Fetch all products
        const products = await Product.find();

        // Prepare product stock and revenue calculation
        let totalRevenue = 0;
        let mostPopular: any = null;
        let maxSold = 0;
        const productStock = products.map((product: any) => {
          const sold = orderItems.find((item) => item._id.toString() === product._id.toString())?.quantitySold || 0;
          // Use discountedPrice if available, else price
          const price = product.discountedPrice > 0 ? product.discountedPrice : product.price;
          const revenue = sold * price;
          totalRevenue += revenue;

          if (sold > maxSold) {
            maxSold = sold;
            mostPopular = {
              productId: product._id,
              title: product.title,
              sold,
            };
          }

          return {
            productId: product._id,
            title: product.title,
            stock: product.stock,
          };
        });
        ResponeUtil.success(res, {
          total_revenue: totalRevenue,
          product_stock: productStock,
          most_popular: mostPopular,
        });
      } catch (error) {
        ResponeUtil.fail(res, 500, "Error calculating revenue", error);
      }
    },
  },
];
