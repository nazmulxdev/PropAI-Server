import { Router } from "express";
import { notificationController } from "./notification.controller.js";
import authMiddleware from "../../middlewares/AuthMiddleware.js";

const router = Router();

router.get(
  "/",
  authMiddleware(),
  notificationController.getUserNotifications,
);

router.patch(
  "/read-all",
  authMiddleware(),
  notificationController.markAllAsRead,
);

router.patch(
  "/:id/read",
  authMiddleware(),
  notificationController.markAsRead,
);

export const notificationRoutes = router;
