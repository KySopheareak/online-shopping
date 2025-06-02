import { Request, Response } from "express";
import Discount from "../models/discounts.model";
import response from "../utils/ResponseUtil";
import Product from "../models/products.model";

export default [
  {
    path: "/discounts",
    method: "post",
    handler: async (req: Request, res: Response) => {
      try {
        const { search } = req.body;
        let filters: any = [{}];
        if (search) {
          filters = [...filters, { name: { $regex: search, $options: "i" } }];
        }
        const projection = {
          product: 1,
          percentage: 1,
          startDate: 1,
          endDate: 1,
          active: 1,
        };

        const discounts = await Discount.find(
          { $and: [...filters] },
          projection
        ).populate("product", "title -_id");

        response.success(res, discounts, "Discounts fetched successfully");
      } catch (err: any) {
        response.fail(
          res,
          500,
          "Internal Server Error",
          "An error occurred while fetching discounts"
        );
      }
    },
  },
  {
    path: "/discounts/:id",
    method: "get",
    handler: async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const discount = await Discount.findById(id, {
          product: 1,
          startDate: 1,
          endDate: 1,
          percentage: 1,
          active: 1,
        }).populate({
          path: "product",
          select: "title price category brand thumbnail",
        });
        if (!discount) {
          return response.fail(
            res,
            404,
            "Discount not found",
            "The requested discount does not exist"
          );
        }
        response.success(res, discount, "Discount fetched successfully");
      } catch (err: any) {
        response.fail(
          res,
          500,
          "Internal Server Error",
          "An error occurred while fetching the discount"
        );
      }
    },
  },
  {
    path: "/discounts/create",
    method: "post",
    handler: async (req: Request, res: Response) => {
      try {
        const { startDate, endDate, percentage, active, product } = req.body;
        if (product.length === 0 || percentage == null) {
          return response.fail(
            res,
            400,
            "Name and percentage are required",
            "Please provide discount name and percentage"
          );
        }
        const newDiscount = await Discount.create({
          startDate,
          endDate,
          percentage,
          active,
          product,
        });

        const products = await Product.find({ _id: { $in: product } });
        // console.log("=====> Products to be updated with discount:", products)
        await Promise.all(
          products.map(async (prod: any) => {
            const discountedPrice = prod.price * (percentage / 100);
            const finalPrice = prod.price - discountedPrice;
            await Product.updateOne(
              { _id: prod._id },
              {
                $set: {
                  discountPercentage: newDiscount._id,
                  discountedPrice: discountedPrice,
                  finalPrice: finalPrice,
                },
              }
            );
          })
        );
        response.success(res, newDiscount, "Discount created successfully");
      } catch (err: any) {
        console.error("=====> Error creating discount:", err);
        response.fail(
          res,
          500,
          "Internal Server Error",
          "An error occurred while creating the discount"
        );
      }
    },
  },
];
