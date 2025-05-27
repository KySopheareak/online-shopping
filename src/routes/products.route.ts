import { Router, Request, Response } from "express";
import Product from "../models/products.model";

export default [
  {
    path: "/products",
    method: "post",
    handler: async (req: Request, res: Response) => {
      try {
        const { title, category } = req.body;
        let filters: any = [{}];
        if (category) {
            filters = [
                ...filters,
                { category: { $in: category } }
            ];
        }
        if (title) {
            filters = [
                ...filters,
                { title: { $regex: title, $options: 'i' } }
            ];
        }
        const projection = {
          title: 1,
          description: 1,
          brand: 1,
          discountPercentage: 1,
          price: 1,
          thumbnail: 1,
        };

        const products = await Product.find({ $and: [...filters]}, projection);
        res.status(200).json(products);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    },
  },
];
