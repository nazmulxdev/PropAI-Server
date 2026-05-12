import { Router } from "express";
import authMiddleware from "../../middlewares/AuthMiddleware";
import validateRequest from "../../middlewares/ValidateRequest";
import { Role } from "../../../generated/prisma/enums";
import {
  createBlogSchema,
  updateBlogSchema,
  blogQuerySchema,
} from "./blog.validation";
import * as controller from "./blog.controller";
import { multerUploader } from "../../config/multer.config";
import { blogUtils } from "./blog.utils";

const router = Router();

// Public
router.get("/", validateRequest(blogQuerySchema), controller.getAllBlogsPublic);
router.get("/:id", controller.getBlogById);

// Admin only
router.get(
  "/admin/all",
  authMiddleware(Role.ADMIN),
  controller.getAllBlogsAdmin,
);
router.post(
  "/",
  authMiddleware(Role.ADMIN),
  multerUploader.fields([{ name: "coverImage", maxCount: 1 }]),
  blogUtils.fileUploaderMiddlewareForCreate,
  validateRequest(createBlogSchema),
  controller.createBlog,
);
router.patch(
  "/:id",
  authMiddleware(Role.ADMIN),
  multerUploader.fields([{ name: "coverImage", maxCount: 1 }]),
  blogUtils.fileUploaderMiddlewareForUpdate,
  validateRequest(updateBlogSchema),
  controller.updateBlog,
);
router.delete("/:id", authMiddleware(Role.ADMIN), controller.deleteBlog);

export const blogRoutes = router;
