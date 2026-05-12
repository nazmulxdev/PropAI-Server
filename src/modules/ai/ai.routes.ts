import { Router } from "express";
import { aiController } from "./ai.controller.js";
import authMiddleware from "../../middlewares/AuthMiddleware.js";
import { Role } from "../../../generated/prisma/enums.js";

const router = Router();

router.post(
  "/generate-description",
  authMiddleware(Role.SELLER, Role.ADMIN),
  aiController.generateDescription,
);

router.get(
  "/recommendations",
  authMiddleware(),
  aiController.getRecommendations,
);

router.post(
  "/chat",
  aiController.chat,
);

export const aiRoutes = router;
