import { Request, Response } from "express";
import Product from "../models/products.model";
import Order from "../models/orders.model";
import ResponeUtil from "../utils/ResponseUtil";

export const getDashboardProductStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const products = await Product.aggregate([
      {
        $addFields: {
          totalAmount: { $multiply: ["$price", "$stock"] },
        },
      },
      {
        $group: {
          _id: null,
          totalInventoryValue: { $sum: "$totalAmount" },
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
        },
      },
      {
        $project: {
          _id: 0,
          totalInventoryValue: 1,
          totalProducts: 1,
          totalStock: 1,
        },
      },
    ]);

    const favoriteProducts = await Product.aggregate([
      {
        $match: {
          "reviews.rating": 5,
        },
      },
      {
        $project: {
          title: 1,
          hasFiveStarReview: {
            $gte: [
              {
                $size: {
                  $filter: {
                    input: "$reviews",
                    as: "review",
                    cond: { $eq: ["$$review.rating", 5] },
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $match: {
          hasFiveStarReview: true,
        },
      },
      {
        $count: "totalFavoriteItems",
      },
    ]);

    const totalOrderedProducts = await Order.aggregate([
      {
        $match: {
          status: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total_amount" },
        },
      },
      {
        $lookup: {
          from: "orders",
          pipeline: [
            { $match: { status: "paid" } },
            { $unwind: "$products" },
            {
              $group: {
                _id: null,
                totalOrdered: { $sum: "$products.quantity" },
              },
            },
          ],
          as: "orderStats",
        },
      },
      {
        $unwind: "$orderStats",
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalOrdered: "$orderStats.totalOrdered",
        },
      },
    ]);

    let responseData: any = {
      save_products: favoriteProducts[0],
      products: products[0],
      total_ordered_products: totalOrderedProducts[0]?.totalOrdered || 0,
      totalRevenue: totalOrderedProducts[0]?.totalRevenue || 0,
    };

    ResponeUtil.success(res, responseData);
  } catch (error) {
    console.error("=====> Error fetching dashboard product status:", error);
    ResponeUtil.fail(
      res,
      500,
      "Internal Server Error",
      "An error occurred while fetching product status"
    );
  }
};

export const getDashBoardOrder = async (req: Request, res: Response) => {
  const { date } = req.body;
  const match: any = {};
  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    match.order_date = {
      $gte: startDate,
      $lte: endDate,
    };
  }
  try {
    // const revenueStats = await Order.aggregate([
    //   {
    //     $match: {
    //       order_date: {
    //         $gte: new Date("2025-01-01"),
    //         $lte: new Date("2025-12-31"),
    //       },
    //       ...match,
    //     },
    //   },
    //   {
    //     $addFields: {
    //       month: { $month: "$order_date" },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: { month: "$month", type: "$status" },
    //       total: { $sum: "$total_amount" },
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id.month",
    //       stats: {
    //         $push: {
    //           k: "$_id.type",
    //           v: "$total",
    //         },
    //       },
    //       totalOrders: {
    //         $sum: {
    //           $cond: [
    //             { $in: ["$status", ["paid", "unpaid"]] },
    //             "$total_amount",
    //             0,
    //           ],
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "orders",
    //       pipeline: [
    //         { $match: { status: ["paid", "unpaid"] }, ...match },
    //         {
    //           $group: {
    //             _id: null,
    //             totalOrdered: { $sum: "$total_amount" },
    //           },
    //         },
    //         {
    //           $group: {
    //             _id: null,
    //             totalOrdered: { $sum: "$totalOrdered" },
    //           },
    //         },
    //       ],
    //       as: "totalOrders",
    //     },
    //   },
    //   {
    //     $unwind: "$totalOrders",
    //   },
    //   {
    //     $project: {
    //       _id: 0,
    //       month: "$_id",
    //       stats: { $arrayToObject: "$stats" },
    //       totalOrders: "$totalOrders.totalOrdered",
    //     },
    //   },
    //   {
    //     $sort: { month: 1 },
    //   },
    // ]);

    // let finalResponse: any = {
    //   orderStats: revenueStats,
    //   totalOrders: revenueStats[0]?.totalOrders || 0
    // }

    // ResponeUtil.success( res, finalResponse, "Revenue stats fetched successfully");

    const result = await Order.aggregate([
      {
        $match: {
          order_date: {
            $gte: new Date("2025-01-01"),
            $lte: new Date("2025-12-31"),
          },
          ...match,
        },
      },
      {
        $facet: {
          orderStats: [
            {
              $addFields: {
                month: { $month: "$order_date" },
              },
            },
            {
              $group: {
                _id: { month: "$month", type: "$status" },
                total: { $sum: "$total_amount" },
              },
            },
            {
              $group: {
                _id: "$_id.month",
                stats: {
                  $push: {
                    k: "$_id.type",
                    v: "$total",
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                month: "$_id",
                stats: { $arrayToObject: "$stats" },
              },
            },
            {
              $sort: { month: 1 },
            },
          ],
          totalOrders: [
            {
              $group: {
                _id: null,
                total: { $sum: "$total_amount" },
              },
            },
            {
              $project: {
                _id: 0,
                total: 1,
              },
            },
          ],
        },
      },
    ]);

    // Restructure result
    const orderStats = result[0]?.orderStats || [];
    const totalOrders = result[0]?.totalOrders[0]?.total || 0;

    let finalResponse: any = {
      orderStats,
      totalOrders,
    };

    ResponeUtil.success(
      res,
      finalResponse,
      "Revenue stats fetched successfully"
    );
  } catch (error) {
    console.error("=====> Error fetching dashboard revenue stats:", error);
    ResponeUtil.fail(
      res,
      500,
      "Internal Server Error",
      "An error occurred while fetching revenue stats"
    );
  }
};
