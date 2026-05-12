import { Router } from "express";
import authMiddleware from "../../middlewares/AuthMiddleware";
import validateRequest from "../../middlewares/ValidateRequest";
import { Role } from "../../../generated/prisma/enums";
import {
  updateUserStatusSchema,
  updateUserRoleSchema,
} from "./user.validation";
import * as controller from "./user.controller";

const router = Router();

// All routes require ADMIN role
router.use(authMiddleware(Role.ADMIN));

router.get("/", controller.getAllUsers);
router.get("/:id", controller.getUserById);
router.patch(
  "/:id/status",
  validateRequest(updateUserStatusSchema),
  controller.updateUserStatus,
);
router.patch(
  "/:id/role",
  validateRequest(updateUserRoleSchema),
  controller.updateUserRole,
);
router.delete("/:id", controller.deleteUser);

export const userRoutes = router;
