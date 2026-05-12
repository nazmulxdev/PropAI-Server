import { Request, Response } from "express";
import catchAsync from "../../shared/CatchAsync.js";
import AppResponse from "../../shared/AppResponse.js";
import { analyticsService } from "./analytics.service.js";

const getSellerAnalytics = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user!.id;
  const analytics = await analyticsService.getSellerAnalytics(sellerId);

  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Seller analytics fetched successfully",
    data: analytics,
  });
});

const getAdminAnalytics = catchAsync(async (req: Request, res: Response) => {
  const analytics = await analyticsService.getAdminAnalytics();

  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Admin analytics fetched successfully",
    data: analytics,
  });
});

export const analyticsController = {
  getSellerAnalytics,
  getAdminAnalytics,
};
