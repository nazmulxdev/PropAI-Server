import { Router } from "express";
import { reviewController } from "./review.controller.js";
import authMiddleware from "../../middlewares/AuthMiddleware.js";
import validateRequest from "../../middlewares/ValidateRequest.js";
import { Role } from "../../../generated/prisma/enums.js";
import {
  createReviewSchema,
  updateReviewSchema,
} from "./review.validation.js";

const router = Router();

router.post(
  "/property/:propertyId",
  authMiddleware(Role.BUYER),
  validateRequest(createReviewSchema),
  reviewController.addReview,
);

router.get("/property/:propertyId", reviewController.getReviews);

router.patch(
  "/:id",
  authMiddleware(Role.BUYER),
  validateRequest(updateReviewSchema),
  reviewController.updateReview,
);

router.delete(
  "/:id",
  authMiddleware(Role.BUYER, Role.ADMIN),
  reviewController.deleteReview,
);

export const reviewRoutes = router;
