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
        // Aggregate order totals per product per month
        const result: any = await Order.aggregate([
            {
                $facet: {
                    finalAmount: [
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
                            $group: {
                                _id: null,
                                total_price: { $sum: "$total_amount" },
                            },
                        },
                        {
                            $project: {
                                total_price: 1,
                            },
                        },
                    ],
                    difineStatus: [
                        {
                            $match: {
                                order_date: {
                                    $gte: new Date("2025-01-01"),
                                    $lte: new Date("2025-12-31"),
                                },
                            },
                        },
                        {
                            $addFields: {
                                month: { $month: "$order_date" },
                            },
                        },
                        {
                            $group: {
                                _id: { status: "$status", month: "$month" },
                                total: { $sum: "$total_amount" },
                            },
                        },
                        {
                            $group: {
                                _id: "$_id.status",
                                monthlyTotals: {
                                    $push: {
                                        month: "$_id.month",
                                        total: "$total",
                                    },
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                name: "$_id",
                                monthlyTotals: 1,
                            },
                        },
                    ],
                },
            },
        ]);

        // Get all months present in the data
        const allMonthsSet = new Set<number>();
        result[0].difineStatus.forEach((stat: any) => {
            stat.monthlyTotals.forEach((m: any) => allMonthsSet.add(m.month));
        });
        const allMonths = Array.from(allMonthsSet).sort((a, b) => a - b);

        // Map month numbers to names
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthly = allMonths.map((m) => monthNames[m - 1]);

        // Build series data
        const series = result[0].difineStatus.map((stat: any) => {
            const data = allMonths.map((monthNum) => {
                const found = stat.monthlyTotals.find((m: any) => m.month === monthNum);
                return found ? found.total : 0;
            });
            return { name: stat.name.charAt(0).toUpperCase() + stat.name.slice(1), data };
        });

        // Calculate totalOrders (number of orders)
        let totalOrders: any = result[0]?.finalAmount[0]?.total_price || 0;

        const finalResponse = {
            monthly,
            series,
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
