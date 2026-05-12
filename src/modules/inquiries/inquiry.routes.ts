import { Router } from "express";
import authMiddleware from "../../middlewares/AuthMiddleware";
import validateRequest from "../../middlewares/ValidateRequest";
import { Role } from "../../../generated/prisma/enums";
import {
  createInquirySchema,
  updateInquiryStatusSchema,
} from "./inquiry.validation";
import * as controller from "./inquiry.controller";

const router = Router();

// Buyer creates inquiry
router.post(
  "/",
  authMiddleware(Role.BUYER),
  validateRequest(createInquirySchema),
  controller.createInquiry,
);

// Buyer's sent inquiries
router.get(
  "/sent",
  authMiddleware(Role.BUYER),

  controller.getSentInquiries,
);

// Seller's received inquiries
router.get(
  "/received",
  authMiddleware(Role.SELLER),
  controller.getReceivedInquiries,
);

// Admin: all inquiries
router.get(
  "/admin",
  authMiddleware(Role.ADMIN),
  controller.getAllInquiriesAdmin,
);

// Seller updates inquiry status
router.patch(
  "/:id/status",
  authMiddleware(Role.SELLER),
  validateRequest(updateInquiryStatusSchema),
  controller.updateInquiryStatus,
);

export const inquiryRoutes = router;
