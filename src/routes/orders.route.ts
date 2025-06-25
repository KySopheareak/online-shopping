import { Request, Response } from "express";
import response from "../utils/ResponseUtil";
import OrderModel from "../models/orders.model";
import ProductModel from "../models/products.model";

export default [
	{
		path: "/order/list",
		method: "post",
		handler: async (req: Request, res: Response) => {
			try {
				const { search, date } = req.body;
				let searchMatch: any = {};
				let dateMatch: any = {};

				if (search) {
					searchMatch = {
						$or: [
							{ "user.username": { $regex: search, $options: "i" } },
							{ "user.email": { $regex: search, $options: "i" } },
							{ "products.product.title": { $regex: search, $options: "i" } },
						],
					};
				}

				if (date) {
					const [year, month] = date.split("-");
					const startDate = new Date(Number(year), Number(month) - 1, 1, 0, 0, 0, 0);
					const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59, 999);
					dateMatch["order.order_date"] = {
						$gte: startDate,
						$lte: endDate,
					};
				}

				const orders = await OrderModel.aggregate([
					{
						$lookup: {
							from: "users",
							localField: "user",
							foreignField: "_id",
							as: "user",
						},
					},
					{ $unwind: "$user" },
					{
						$unwind: "$products",
					},
					{
						$lookup: {
							from: "products",
							localField: "products.product",
							foreignField: "_id",
							as: "products.product",
						},
					},
					{ $unwind: "$products.product" },
					...(search ? [{ $match: searchMatch }] : []),
					{
						$group: {
							_id: "$_id"
						}
					},
					{
						$lookup: {
							from: "orders",
							localField: "_id",
							foreignField: "_id",
							as: "order"
						}
					},
					{ $unwind: "$order" },
					{
						$lookup: {
							from: "users",
							localField: "order.user",
							foreignField: "_id",
							as: "order.user",
						},
					},
					{ $unwind: "$order.user" },
					{ $unwind: "$order.products" },
					{
						$lookup: {
							from: "products",
							localField: "order.products.product",
							foreignField: "_id",
							as: "order.products.product",
						},
					},
					{ $unwind: "$order.products.product" },
					...(date ? [{ $match: dateMatch }] : []),
					{
						$group: {
							_id: "$order._id",
							user: { $first: "$order.user" },
							order_date: { $first: "$order.order_date" },
							status: { $first: "$order.status" },
							products: { $push: "$order.products" },
							total_amount: { $first: "$order.total_amount" },
						},
					},
					{
						$project: {
							_id: 1,
							"user.username": 1,
							"user.email": 1,
							order_date: 1,
							status: 1,
							products: {
								$map: {
									input: "$products",
									as: "product",
									in: {
										productId: "$$product.product._id",
										title: "$$product.product.title",
										price: "$$product.product.price",
										quantity: "$$product.quantity",
									},
								},
							},
							total_amount: 1,
						},
					},
					{ $sort: { order_date: -1 } }
				]);
				response.success(res, orders, "Orders retrieved successfully");
			} catch (error) {
				console.error(error);
				res.status(500).json({ message: "Internal server error" });
			}
		},
	},
	{
		path: "/order",
		method: "post",
		handler: async (req: Request, res: Response) => {
			try {
				const { user, products } = req.body;
				if (!user || !Array.isArray(products) || products.length === 0) {
					return response.fail(
						res,
						400,
						"User and products are required",
						null
					);
				}

				// Validate all products and calculate total_amount
				let total_amount = 0;
				for (const item of products) {
					if (!item.product || !item.quantity || item.quantity < 1) {
						return response.fail(
							res,
							400,
							"Each product must have a valid product ID and quantity",
							null
						);
					}

					const productData = await ProductModel.findById(item.product);
					if (!productData) {
						return response.fail(
							res,
							404,
							`Product not found: ${item.product}`,
							null
						);
					}

					// Check stock
					if (productData.stock < item.quantity) {
						return response.fail(
							res,
							400,
							`Insufficient stock for product: ${item.product}`,
							null
						);
					}
					total_amount += productData.price * item.quantity;
				}

				// Reduce stock for each product
				for (const item of products) {
					await ProductModel.findByIdAndUpdate(
						item.product,
						{ $inc: { stock: -item.quantity } },
						{ new: true }
					);
				}

				const order = await OrderModel.create({
					user,
					products,
					total_amount,
				});

				response.success(res, order, "Order successfully");
			} catch (error) {
				res.status(500).json({ message: "Internal server error" });
			}
		},
	},
	{
		path: "/order/:id",
		method: "get",
		handler: async (req: Request, res: Response) => {
			try {
				const order = await OrderModel.findById(req.params.id).populate({
					path: "products.product",
					select: "title price _id",
				});

				if (!order) {
					return response.fail(res, 404, "Order not found", null);
				}
				response.success(res, order, "Order retrieved successfully");
			} catch (error) {
				console.error(error);
				response.fail(res, 500, "Internal server error", null);
			}
		},
	},
	{
		path: "/order/:id/pay-scan",
		method: "get",
		handler: async (req: Request, res: Response) => {
			try {
				const { id } = req.params;
				const order = await OrderModel.findById(id);

				if (!order) {
					return response.fail(res, 404, "Order not found", null);
				}

				if (order.status === "paid") {
					return response.fail(res, 400, "Order is already paid", null);
				}
				order.status = "paid";
				await order.save();
				response.success(res, order, "Order marked as paid via scan.");
			} catch (error) {
				res.status(500).send("Internal server error");
			}
		},
	},
	{
		path: "/order/:id/status",
		method: "get",
		handler: async (req: Request, res: Response) => {
			try {
				const order = await OrderModel.findById(req.params.id);
				if (!order) return res.status(404).json({ status: "not_found" });
				res.json({ status: order.status });
			} catch (err) {
				console.error(err);
				res.status(500).json({ status: "error" });
			}
		},
	},
	{
		path: "/order/:id/cancel",
		method: "get",
		handler: async (req: Request, res: Response) => {
			try {
				const order = await OrderModel.findById(req.params.id);
				if (!order) return response.fail(res, 404, "Order not found", null);

				if (order.status === "cancelled") {
					return response.fail(res, 400, "Order is already cancelled", null);
				}

				// Update stock for each product in the order
				for (const item of order.products) {
					await ProductModel.findByIdAndUpdate(
						item.product,
						{ $inc: { stock: item.quantity } },
						{ new: true }
					);
				}

				order.status = "cancelled";
				await order.save();
				response.success(res, order, "Order cancelled successfully");
			} catch (error) {
				console.error(error);
				res.status(500).json({ message: "Internal server error" });
			}
		},
	},
];
