import { Request, Response } from "express";
import catchAsync from "../../shared/CatchAsync";
import AppResponse from "../../shared/AppResponse";
import { notificationService } from "./notification.service";
import { IQueryParams } from "../../interfaces/query.interface";

const getNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await notificationService.getNotifications(
    userId,
    req.query as IQueryParams,
  );
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notifications fetched",
    data: result.data,
    meta: result.meta,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const notificationId = req.params.id as string;
  const notification = await notificationService.markAsRead(
    notificationId,
    userId,
  );
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Notification marked as read",
    data: { notification },
  });
});

const markAllAsRead = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await notificationService.markAllAsRead(userId);
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: result,
  });
});

const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const notificationId = req.params.id as string;
  const result = await notificationService.deleteNotification(
    notificationId,
    userId,
  );
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
    data: result,
  });
});

export const notificationController = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
