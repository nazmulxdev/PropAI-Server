import { Router } from "express";
import authMiddleware from "../../middlewares/AuthMiddleware";
import validateRequest from "../../middlewares/ValidateRequest";
import { Role } from "../../../generated/prisma/enums";
import { createReviewSchema, updateReviewSchema } from "./review.validation";
import * as controller from "./review.controller";

const router = Router();

// Public: get reviews for a property
router.get("/property/:propertyId", controller.getReviewsByProperty);

// Buyer: create review
router.post(
  "/",
  authMiddleware(Role.BUYER),
  validateRequest(createReviewSchema),
  controller.createReview,
);

// Owner: update / delete own review
router.patch(
  "/:id",
  authMiddleware(Role.BUYER),
  validateRequest(updateReviewSchema),
  controller.updateReview,
);
router.delete(
  "/:id",
  authMiddleware(Role.BUYER, Role.ADMIN),
  controller.deleteReview,
);

export const reviewRoutes = router;
