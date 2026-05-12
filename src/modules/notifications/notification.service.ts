import { prisma } from "../../lib/prisma.js";
import AppError from "../../shared/AppError.js";

const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string,
) => {
  return await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      link,
      isRead: false,
    },
  });
};

const getUserNotifications = async (userId: string) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
};

const markAsRead = async (notificationId: string, userId: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new AppError(404, "Notification not found", "NOT_FOUND");
  }

  if (notification.userId !== userId) {
    throw new AppError(403, "Not authorized", "UNAUTHORIZED");
  }

  return await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

const markAllAsRead = async (userId: string) => {
  return await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};

export const notificationService = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
