import { Request, Response } from "express";
import catchAsync from "../../shared/CatchAsync.js";
import AppResponse from "../../shared/AppResponse.js";
import { notificationService } from "./notification.service.js";

const getUserNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const notifications = await notificationService.getUserNotifications(userId);

  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notifications fetched successfully",
    data: { notifications },
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const notificationId = req.params.id as string;
  await notificationService.markAsRead(notificationId, userId);

  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification marked as read",
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  await notificationService.markAllAsRead(userId);

  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "All notifications marked as read",
  });
});

export const notificationController = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
