import { Request, Response } from "express";
import catchAsync from "../../shared/CatchAsync.js";
import AppResponse from "../../shared/AppResponse.js";
import { statsService } from "./stats.service.js";
import { Role } from "../../../generated/prisma/enums.js";

const getMyStats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role as Role;
  
  const stats = await statsService.getUserStats(userId, role);

  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Stats retrieved successfully",
    data: stats,
  });
});

export const statsController = {
  getMyStats,
};
