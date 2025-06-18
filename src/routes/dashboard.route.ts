import { getDashboardStats } from "../controllers/dashboard.controller";
import { getDashboardProductStatus } from "../controllers/dashboard.controller";
import { Request, Response } from "express";
import ResponseUtil from "../utils/ResponseUtil";

export default [
  {
    path: "/dashboard",
    method: "post",
    handler: (req: Request, res: Response) => {
      const { start_date, end_date } = req.body as { start_date?: string; end_date?: string };
      let startDate: Date, endDate: Date;

      if (start_date && end_date) {
        startDate = new Date(start_date);
        endDate = new Date(end_date);
        endDate.setHours(23, 59, 59, 999);
      } else {
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }

      req.body._dashboardFilter = { startDate, endDate };
      getDashboardStats(req, res);
    },
  },

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
  }
];