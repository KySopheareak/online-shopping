import { getDashboardStats } from "../controllers/dashboard.controller";
import { Request, Response } from "express";

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
];