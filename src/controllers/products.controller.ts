import { Response } from "express";
import Product from "../models/products.model";
import response from "../utils/ResponseUtil";

export const getProductsWithDiscount = async (
  matchConditions: any[],
  res: Response,
  page: number = 1,
  limit: number = 10
) => {
  try {
    // 1. Get total count
    const totalItems = await Product.countDocuments(
      matchConditions.length ? { $and: matchConditions } : {}
    );
    const totalPages = Math.ceil(totalItems / limit);

    // 2. Build aggregation pipeline with pagination
    const aggregatePipeline = [
      ...(matchConditions.length ? [{ $match: { $and: matchConditions } }] : []),
      {
        $lookup: {
          from: "discounts",
          localField: "discountPercentage",
          foreignField: "_id",
          as: "discountPercentage",
        },
      },
      {
        $unwind: {
          path: "$discountPercentage",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          category: 1,
          brand: 1,
          price: 1,
          discountPercentage: "$discountPercentage.percentage",
          discountedPrice: 1,
          finalPrice: 1,
          thumbnail: 1,
          stock: 1,
        },
      },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const products = await Product.aggregate(aggregatePipeline);

    // 3. Respond with pagination info
    let pagination: any = {
      page: page,
      count: limit,
      total: totalItems,
    }
    response.success(res, {
      products,
      pagination
    }, "Products fetched successfully!");

  } catch (err: any) {
    console.error("=====> Error fetching products:", err);
    response.fail(
      res,
      500,
      "Internal Server Error",
      "An error occurred while fetching products"
    );
  }
};