import { getDashboardProductStatus, getDashBoardOrder } from "../controllers/dashboard.controller";
import { Request, Response } from "express";
import ResponseUtil from "../utils/ResponseUtil";

export default [
    {
        path: "/dashboard/product/stats",
        method: "get",
        handler: async (req: Request, res: Response) => {
            try {
                getDashboardProductStatus(req, res);
            } catch (err: any) {
                console.error("=====> Error fetching dashboard product status:", err);
                ResponseUtil.fail(res, 500, "Internal Server Error", "An error occurred while fetching product status");
            }
        }
    },
    {
        path: "/dashboard/order/stats",
        method: "post",
        handler: async (req: Request, res: Response) => {
            try {
                getDashBoardOrder(req, res);
            } catch (err: any) {
                console.error("=====> Error fetching dashboard revenue stats:", err);
                ResponseUtil.fail(res, 500, "Internal Server Error", "An error occurred while fetching revenue stats");
            }
        }
    }

];