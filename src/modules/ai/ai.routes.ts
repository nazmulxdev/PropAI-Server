import { Router } from "express";

import authMiddleware from "../../middlewares/AuthMiddleware";
import { Role } from "../../../generated/prisma/enums";
import { aiController } from "./ai.controller";

const router = Router();

router.post(
  "/recommendations",
  authMiddleware(Role.BUYER),
  aiController.getRecommendations,
);

router.post(
  "/generate/property-description",
  authMiddleware(Role.SELLER, Role.ADMIN),
  aiController.generatePropertyDescription,
);

router.post(
  "/generate/blog-post",
  authMiddleware(Role.ADMIN),
  aiController.generateBlogPost,
);
router.post(
  "/generate/property-tags",
  authMiddleware(Role.SELLER),
  aiController.generatePropertyTags,
);
router.post(
  "/analyze/seller",
  authMiddleware(Role.SELLER),
  aiController.analyzeSeller,
);
router.post(
  "/analyze/admin",
  authMiddleware(Role.ADMIN),
  aiController.analyzeAdmin,
);

export const aiRoutes = router;
