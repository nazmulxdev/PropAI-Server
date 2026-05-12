import { Router } from "express";
import { propertyController } from "./property.controller.js";
import authMiddleware from "../../middlewares/AuthMiddleware.js";
import validateRequest from "../../middlewares/ValidateRequest.js";
import { Role } from "../../../generated/prisma/enums.js";
import {
  createPropertySchema,
  updatePropertySchema,
} from "./property.validation.js";
import { multerUploader } from "../../config/multer.config.js";
import { propertyUtils } from "./property.utils.js";

const router = Router();

// Public
router.get("/", propertyController.getProperties);
router.get("/:id", propertyController.getPropertyById);

// Seller's own listings
router.get(
  "/seller/my-listings",
  authMiddleware(Role.SELLER),
  propertyController.getMyListings,
);

// Admin: all properties (any status)
router.get(
  "/admin/all",
  authMiddleware(Role.ADMIN),
  propertyController.getAllPropertiesAdmin,
);

// Create / Update / Delete (Seller/Admin)
router.post(
  "/",
  authMiddleware(Role.SELLER, Role.ADMIN),
  multerUploader.fields([{ name: "images", maxCount: 3 }]),
  propertyUtils.fileuploaderMiddlewareForCreate,
  validateRequest(createPropertySchema),
  propertyController.createProperty,
);
router.patch(
  "/:id",
  authMiddleware(Role.SELLER, Role.ADMIN),
  multerUploader.fields([{ name: "images", maxCount: 3 }]),
  propertyUtils.fileuploaderMiddlewareForUpdate,
  validateRequest(updatePropertySchema),
  propertyController.updateProperty,
);
router.delete(
  "/:id",
  authMiddleware(Role.SELLER, Role.ADMIN),
  propertyController.deleteProperty,
);

// Admin: change status
router.patch(
  "/:id/status",
  authMiddleware(Role.ADMIN),
  propertyController.updatePropertyStatus,
);

// Buyer: save / unsave
router.post(
  "/:id/save",
  authMiddleware(Role.BUYER),
  propertyController.toggleSaveProperty,
);
router.get(
  "/saved/list",
  authMiddleware(Role.BUYER),
  propertyController.getSavedProperties,
);

// Buyer: record view
router.post(
  "/:id/view",
  authMiddleware(Role.BUYER),
  propertyController.recordView,
);

export const propertyRoutes = router;
