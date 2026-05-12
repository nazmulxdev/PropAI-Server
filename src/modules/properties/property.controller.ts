import { Request, Response } from "express";
import catchAsync from "../../shared/CatchAsync.js";
import AppResponse from "../../shared/AppResponse.js";
import { propertyService } from "./property.service.js";
import { IQueryParams } from "../../interfaces/query.interface.js";

const createProperty = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user!.id;
  const property = await propertyService.createProperty(req.body, sellerId);
  AppResponse(res, {
    statusCode: 201,
    success: true,
    message: "Property created successfully",
    data: { property },
  });
});

// Public active listings
const getProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await propertyService.getProperties(req.query as IQueryParams);
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Properties fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

// Single property
const getPropertyById = catchAsync(async (req: Request, res: Response) => {
  const property = await propertyService.getPropertyById(
    req.params.id as string,
  );
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Property fetched successfully",
    data: { property },
  });
});

// Update (seller/admin)
const updateProperty = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;
  const property = await propertyService.updateProperty(
    req.params.id as string,
    req.body,
    user,
  );
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Property updated successfully",
    data: { property },
  });
});

// Delete (seller/admin)
const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;
  const result = await propertyService.deleteProperty(
    req.params.id as string,
    user,
  );
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Property deleted successfully",
    data: result,
  });
});

// Admin: change status
const updatePropertyStatus = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.body;
  const property = await propertyService.updatePropertyStatus(
    req.params.id as string,
    status,
  );
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Property status updated",
    data: { property },
  });
});

// Seller: my listings (all statuses)
const getMyListings = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user!.id;
  const result = await propertyService.getMyListings(
    sellerId,
    req.query as IQueryParams,
  );
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Your listings fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

// Admin: all properties (any status)
const getAllPropertiesAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await propertyService.getAllPropertiesAdmin(
      req.query as IQueryParams,
    );
    AppResponse(res, {
      statusCode: 200,
      success: true,
      message: "All properties fetched",
      data: result.data,
      meta: result.meta,
    });
  },
);

// Buyer: toggle save / unsave
const toggleSaveProperty = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const propertyId = req.params.id as string;
  const result = await propertyService.toggleSaveProperty(userId, propertyId);
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: result.saved ? "Property saved" : "Property unsaved",
    data: result,
  });
});

// Buyer: get saved properties
const getSavedProperties = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await propertyService.getSavedProperties(
    userId,
    req.query as IQueryParams,
  );
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Saved properties fetched",
    data: result.data,
    meta: result.meta,
  });
});

// Buyer: record view
const recordView = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const propertyId = req.params.id as string;
  const result = await propertyService.recordPropertyView(userId, propertyId);
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "View recorded",
    data: result,
  });
});

export const propertyController = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
  getMyListings,
  getAllPropertiesAdmin,
  toggleSaveProperty,
  getSavedProperties,
  recordView,
};
