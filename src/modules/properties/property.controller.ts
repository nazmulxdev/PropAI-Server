import { Request, Response } from "express";
import catchAsync from "../../shared/CatchAsync.js";
import AppResponse from "../../shared/AppResponse.js";
import { propertyService } from "./property.service.js";

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

const getProperties = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    type: req.query.type as string,
    city: req.query.city as string,
    listingType: req.query.listingType as string,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    bedrooms: req.query.bedrooms ? Number(req.query.bedrooms) : undefined,
    search: req.query.search as string,
  };

  const pagination = {
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 12,
    sortBy: req.query.sortBy as string,
  };

  const result = await propertyService.getProperties(filters, pagination);

  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Properties fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getPropertyById = catchAsync(async (req: Request, res: Response) => {
  const property = await propertyService.getPropertyById(req.params.id as string);

  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Property fetched successfully",
    data: { property },
  });
});

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

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  const user = req.user!;
  const result = await propertyService.deleteProperty(req.params.id as string, user);

  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Property deleted successfully",
    data: result,
  });
});

export const propertyController = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};
