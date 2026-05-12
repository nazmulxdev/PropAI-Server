import { Router } from "express";
import { analyticsController } from "./analytics.controller.js";
import authMiddleware from "../../middlewares/AuthMiddleware.js";
import { Role } from "../../../generated/prisma/enums.js";

const router = Router();

router.get(
  "/seller",
  authMiddleware(Role.SELLER, Role.ADMIN),
  analyticsController.getSellerAnalytics,
);

router.get(
  "/admin",
  authMiddleware(Role.ADMIN),
  analyticsController.getAdminAnalytics,
);

export const analyticsRoutes = router;
