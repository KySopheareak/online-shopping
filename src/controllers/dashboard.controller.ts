import { Request, Response } from "express";
import Product from "../models/products.model";
import Order from "../models/orders.model";
import ResponeUtil from "../utils/ResponseUtil";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.body._dashboardFilter;

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
          _id: "$products.product",
          quantitySold: { $sum: "$products.quantity" },
        },
      },
    ]);

    // Fetch all products
    const products = await Product.find();

    let totalRevenue = 0;
    let mostPopular: any = null;
    let maxSold = 0;

    // Only include products that have been ordered
    const productStock = orderItems.map((orderItem) => {
      const product = products.find((p: any) => p._id.toString() === orderItem._id.toString());
      if (!product) return null;

      const sold = orderItem.quantitySold;
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
        amountSold: sold,
        revenue,
      };
    }).filter(Boolean); // Remove nulls

    ResponeUtil.success(res, {
      total_revenue: totalRevenue,
      product_stock: productStock,
      most_popular: mostPopular,
    });
  } catch (error) {
    ResponeUtil.fail(res, 500, "Error calculating revenue", error);
  }
};