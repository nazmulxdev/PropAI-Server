import { Router } from "express";
import { inquiryController } from "./inquiry.controller.js";
import authMiddleware from "../../middlewares/AuthMiddleware.js";
import validateRequest from "../../middlewares/ValidateRequest.js";
import { Role } from "../../../generated/prisma/enums.js";
import {
  createInquirySchema,
  updateInquiryStatusSchema,
} from "./inquiry.validation.js";

const router = Router();

router.post(
  "/",
  authMiddleware(Role.BUYER, Role.ADMIN),
  validateRequest(createInquirySchema),
  inquiryController.sendInquiry,
);

router.get(
  "/buyer",
  authMiddleware(Role.BUYER, Role.ADMIN),
  inquiryController.getBuyerInquiries,
);

router.get(
  "/seller",
  authMiddleware(Role.SELLER, Role.ADMIN),
  inquiryController.getSellerInquiries,
);

router.patch(
  "/:id/status",
  authMiddleware(Role.SELLER, Role.ADMIN),
  validateRequest(updateInquiryStatusSchema),
  inquiryController.updateInquiryStatus,
);

router.get(
  "/:id/conversation",
  authMiddleware(Role.BUYER, Role.SELLER, Role.ADMIN),
  inquiryController.getConversationByInquiryId,
);

router.get(
  "/conversation/:id/messages",
  authMiddleware(Role.BUYER, Role.SELLER, Role.ADMIN),
  inquiryController.getMessagesByConversationId,
);

export const inquiryRoutes = router;
