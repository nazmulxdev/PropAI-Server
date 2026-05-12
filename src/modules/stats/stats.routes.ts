import { Router } from "express";
import { statsController } from "./stats.controller.js";
import authMiddleware from "../../middlewares/AuthMiddleware.js";
import { Role } from "../../../generated/prisma/enums.js";

const router = Router();

router.get(
  "/",
  authMiddleware(Role.ADMIN, Role.BUYER, Role.SELLER),
  statsController.getMyStats,
);

export const statsRoutes = router;
