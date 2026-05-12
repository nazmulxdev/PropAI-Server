/* eslint-disable @typescript-eslint/no-explicit-any */
import { Notification, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../shared/AppError";
import { IQueryParams } from "../../interfaces/query.interface";

import {
  notificationSearchableFields,
  notificationFilterableFields,
  notificationDefaultInclude,
} from "./notification.constant";
import { QueryBuilder } from "../../utils/QueryBuilders";
import { getIO } from "../../lib/socket";

// Get paginated notifications for a user
const getNotifications = async (userId: string, query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Notification,
    Prisma.NotificationWhereInput,
    Prisma.NotificationInclude
  >(prisma.notification, query, {
    searchableFields: notificationSearchableFields,
    filterableFields: notificationFilterableFields,
  });
  const result = await queryBuilder
    .search()
    .filter()
    .where({ userId } as any)
    .paginate()
    .sort()
    .dynamicInclude(notificationDefaultInclude)
    .execute();

  return result;
};

// Mark a single notification as read
const markAsRead = async (notificationId: string, userId: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });
  if (!notification)
    throw new AppError(404, "Notification not found", "NOT_FOUND");
  if (notification.userId !== userId)
    throw new AppError(403, "Unauthorized", "UNAUTHORIZED");

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

// Mark all notifications as read for a user
const markAllAsRead = async (userId: string) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return { message: "All notifications marked as read" };
};

// Delete a notification (soft delete? — we just hard delete)
const deleteNotification = async (notificationId: string, userId: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });
  if (!notification)
    throw new AppError(404, "Notification not found", "NOT_FOUND");
  if (notification.userId !== userId)
    throw new AppError(403, "Unauthorized", "UNAUTHORIZED");

  await prisma.notification.delete({ where: { id: notificationId } });
  return { message: "Notification deleted" };
};

const createNotification = async (data: {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}) => {
  const notification = await prisma.notification.create({ data });

  // Emit real‑time event to the target user
  try {
    const io = getIO();
    io.to(`user_${data.userId}`).emit("notification", {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      createdAt: notification.createdAt,
    });
  } catch (error) {
    console.warn("Failed to emit real-time notification:", error);
  }

  return notification;
};

export const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
};
