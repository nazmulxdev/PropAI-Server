import { Router } from "express";
import authMiddleware from "../../middlewares/AuthMiddleware";
import { Role } from "../../../generated/prisma/enums";
import { messageController } from "./messages.controller";

const router = Router();

// All routes require authentication
router.use(authMiddleware(Role.BUYER, Role.SELLER, Role.ADMIN));

router.get("/conversations", messageController.getConversations);
router.get("/conversations/:conversationId", messageController.getMessages);
router.post(
  "/conversations/:conversationId/read",
  messageController.markConversationAsRead,
);

export const messageRoutes = router;
