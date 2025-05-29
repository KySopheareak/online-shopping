import { Request, Response } from "express";
import Product from "../models/products.model";
import response from "../utils/ResponseUtil";

export default [
  {
    path: "/products",
    method: "post",
    handler: async (req: Request, res: Response) => {
      try {
        const { search, category } = req.body;
        let filters: any = [{}];
        
        if (category) {
          filters = [
              ...filters,
              { category: { $in: category } }
          ];
        }
        if (search) {
            filters = [
                ...filters,
                { title: { $regex: search, $options: 'i' } }
            ];
        }
        const projection = {
          title: 1,
          description: 1,
          category: 1,
          brand: 1,
          discountPercentage: 1,
          price: 1,
          thumbnail: 1,
        };

        const products = await Product.find({ $and: [...filters]}, projection);
        response.success(res, products, "Products fetched successfully")
      } catch (err: any) {
        response.fail(res, 500, "Internal Server Error",  "An error occurred while fetching products");
      }
    },
  },
  {
    path: "/products/:id",
    method: "get",
    handler: async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const product = await Product.findById(id, 
          {
            title: 1,
            description: 1,
            brand: 1,
            discountPercentage: 1,
            price: 1,
            thumbnail: 1,
          }
        );
        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }
        res.status(200).json(product);
      } catch (err: any) {
        res.status(500).json({ error: err.message || "Internal Server Erro!" });
      }
    }
  }
];
