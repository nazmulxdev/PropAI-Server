import { z } from "zod";
import {
  PriceType,
  PropertyStatus,
  ListingType,
  PropertyType,
  FurnishedStatus,
} from "../../../generated/prisma/enums.js";

export const createPropertySchema = {
  body: z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters"),
    price: z.number().positive("Price must be a positive number"),
    priceType: z.nativeEnum(PriceType).optional(),
    listingType: z.nativeEnum(ListingType),
    type: z.nativeEnum(PropertyType),
    city: z.string().min(2, "City is required"),
    area: z.string().min(2, "Area is required"),
    address: z.string().min(5, "Address is required"),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    bedrooms: z.number().int().nonnegative().optional(),
    bathrooms: z.number().int().nonnegative().optional(),
    areaSqft: z.number().positive().optional(),
    floorNumber: z.number().int().optional(),
    totalFloors: z.number().int().optional(),
    parkingSpaces: z.number().int().nonnegative().optional(),
    yearBuilt: z.number().int().optional(),
    furnished: z.nativeEnum(FurnishedStatus).optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string().url()).optional(),
    tags: z.array(z.string()).optional(),
  }),
};

export const updatePropertySchema = {
  body: createPropertySchema.body.partial().extend({
    status: z.nativeEnum(PropertyStatus).optional(),
  }),
};

export const getPropertiesQuerySchema = {
  query: z.object({
    type: z.nativeEnum(PropertyType).optional(),
    city: z.string().optional(),
    listingType: z.nativeEnum(ListingType).optional(),
    minPrice: z.string().regex(/^\d+$/).transform(Number).optional(),
    maxPrice: z.string().regex(/^\d+$/).transform(Number).optional(),
    bedrooms: z.string().regex(/^\d+$/).transform(Number).optional(),
    search: z.string().optional(),
    sortBy: z
      .enum(["price_asc", "price_desc", "createdAt_desc", "createdAt_asc"])
      .optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
};
