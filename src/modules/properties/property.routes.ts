import { Router } from "express";
import { propertyController } from "./property.controller.js";
import authMiddleware from "../../middlewares/AuthMiddleware.js";
import validateRequest from "../../middlewares/ValidateRequest.js";
import { Role } from "../../../generated/prisma/enums.js";
import {
  createPropertySchema,
  updatePropertySchema,
  getPropertiesQuerySchema,
} from "./property.validation.js";

const router = Router();

router.post(
  "/",
  authMiddleware(Role.SELLER, Role.ADMIN),
  validateRequest(createPropertySchema),
  propertyController.createProperty,
);

router.get(
  "/",
  validateRequest(getPropertiesQuerySchema),
  propertyController.getProperties,
);

router.get("/:id", propertyController.getPropertyById);

router.patch(
  "/:id",
  authMiddleware(Role.SELLER, Role.ADMIN),
  validateRequest(updatePropertySchema),
  propertyController.updateProperty,
);

router.delete(
  "/:id",
  authMiddleware(Role.SELLER, Role.ADMIN),
  propertyController.deleteProperty,
);

export const propertyRoutes = router;
