import { Request, Response } from "express";
import Category from "../models/categories.model";
import response from "../utils/ResponseUtil";

export default [
  {
    path: "/categories",
    method: "post",
    handler: async (req: Request, res: Response) => {
      try {
        const { search } = req.body;
        let filters: any = [{}];
        if (search) {
            filters = [
                ...filters,
                { name: { $regex: search, $options: 'i' } }
            ];
        }
        const projection = {
          name: 1,
        };

        const categories = await Category.find({ $and: [...filters]}, projection);
        response.success(res, categories, "Products fetched successfully")
      } catch (err: any) {
        response.fail(res, 500, "Internal Server Error",  "An error occurred while fetching products");
      }
    },
  },
  {
    path: "/categories/:id",
    method: "get",
    handler: async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const category = await Category.findById(id, 
          {
            name: 1,
          }
        );
        if (!category) {
            return response.fail(res, 404, "Category not found", "The requested category does not exist");
        }
        response.success(res, category, "Category fetched successfully");
      } catch (err: any) {
        response.fail(res, 500, "Internal Server Error", "An error occurred while fetching the category");
      }
    }
  },

  {
    path: "/categories/create",
    method: "post",
    handler: async (req: Request, res: Response) => {
      try {
        const { name } = req.body;
        if (!name) {
          return response.fail(res, 400, "Name is required", "Please provide a category name");
        }
        const newCategory = await Category.create({ name });
        response.success(res, newCategory, "Category created successfully");
      } catch (err: any) {
        response.fail(res, 500, "Internal Server Error", "An error occurred while creating the category");
      }
    }
  }
];
