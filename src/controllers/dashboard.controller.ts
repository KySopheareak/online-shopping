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

export const getDashboardProductStatus = async (req: Request, res: Response) => {
  try {
    const products = await Product.aggregate([
      {
        $addFields: {
          totalAmount: { $multiply: ["$price", "$stock"] }
        }
      },
      {
        $group: {
          _id: null,
          totalInventoryValue: { $sum: "$totalAmount" },
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" }
        }
      },
      {
        $project: {
          _id: 0,
          totalInventoryValue: 1,
          totalProducts: 1,
          totalStock: 1
        }
      }
    ]);

    const favoriteProducts = await Product.aggregate([
      {
        $match: {
          "reviews.rating": 5
        }
      },
      {
        $project: {
          title: 1,
          hasFiveStarReview: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: "$reviews",
                    as: "review",
                    cond: { $eq: ["$$review.rating", 5] }
                  }
                }
              },
              0
            ]
          }
        }
      },
      {
        $match: {
          hasFiveStarReview: true
        }
      },
      {
        $count: "totalFavoriteItems"
      }
    ]);

    let responseData: any [] = [
      favoriteProducts[0],
      products[0]
    ];


    ResponeUtil.success(res, responseData);
  } catch (error) {
    console.error("=====> Error fetching dashboard product status:", error);
    ResponeUtil.fail(res, 500, "Internal Server Error", "An error occurred while fetching product status");
  }
};