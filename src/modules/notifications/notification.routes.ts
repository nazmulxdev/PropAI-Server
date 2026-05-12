import { Router } from "express";
import authMiddleware from "../../middlewares/AuthMiddleware";
import { Role } from "../../../generated/prisma/enums";
import { notificationController } from "./notification.controller";

const router = Router();

// All routes require auth
router.use(authMiddleware(Role.BUYER, Role.SELLER, Role.ADMIN));

router.get("/", notificationController.getNotifications);
router.patch("/:id/read", notificationController.markAsRead);
router.post("/read-all", notificationController.markAllAsRead);
router.delete("/:id", notificationController.deleteNotification);

export const notificationRoutes = router;
