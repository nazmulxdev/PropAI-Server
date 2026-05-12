/* eslint-disable no-useless-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../../lib/prisma.js";
import AppError from "../../shared/AppError.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { Role, PropertyStatus } from "../../../generated/prisma/enums.js";

// Type definition for filtering properties
interface IPropertyFilterParams {
  type?: string;
  city?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  search?: string;
}

interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
}

const createProperty = async (data: any, sellerId: string) => {
  const slug =
    data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

  const property = await prisma.property.create({
    data: {
      ...data,
      slug,
      sellerId,
      status: PropertyStatus.PENDING,
    },
  });

  return property;
};

const getProperties = async (
  filters: IPropertyFilterParams,
  pagination: IPaginationOptions,
) => {
  const { page = 1, limit = 12, sortBy = "createdAt_desc" } = pagination;
  const skip = (page - 1) * limit;

  // Build the WHERE clause
  const where: Prisma.PropertyWhereInput = {
    status: PropertyStatus.ACTIVE, // Only show active properties to public
  };

  if (filters.type) {
    where.type = filters.type as any;
  }
  if (filters.city) {
    where.city = { contains: filters.city, mode: "insensitive" };
  }
  if (filters.listingType) {
    where.listingType = filters.listingType as any;
  }
  if (filters.bedrooms) {
    where.bedrooms = { gte: filters.bedrooms };
  }
  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = filters.minPrice;
    if (filters.maxPrice) where.price.lte = filters.maxPrice;
  }
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { address: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  // Build the ORDER BY clause
  let orderBy: Prisma.PropertyOrderByWithRelationInput = {};
  switch (sortBy) {
    case "price_asc":
      orderBy = { price: "asc" };
      break;
    case "price_desc":
      orderBy = { price: "desc" };
      break;
    case "createdAt_asc":
      orderBy = { createdAt: "asc" };
      break;
    case "createdAt_desc":
    default:
      orderBy = { createdAt: "desc" };
      break;
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return {
    data: properties,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getPropertyById = async (id: string) => {
  const property = await prisma.property.findFirst({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
        },
      },
    },
  });

  if (!property) {
    throw new AppError(404, "Property not found", "NOT_FOUND");
  }

  // Increment view count asynchronously
  prisma.property
    .update({
      where: { id: property.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(console.error);

  return property;
};

const updateProperty = async (
  id: string,
  data: any,
  user: { id: string; role: string },
) => {
  const property = await prisma.property.findUnique({
    where: { id },
  });

  if (!property) {
    throw new AppError(404, "Property not found", "NOT_FOUND");
  }

  // Check authorization
  if (property.sellerId !== user.id && user.role !== Role.ADMIN) {
    throw new AppError(
      403,
      "You are not authorized to update this property",
      "UNAUTHORIZED",
    );
  }

  const updatedProperty = await prisma.property.update({
    where: { id },
    data,
  });

  return updatedProperty;
};

const deleteProperty = async (
  id: string,
  user: { id: string; role: string },
) => {
  const property = await prisma.property.findUnique({
    where: { id },
  });

  if (!property) {
    throw new AppError(404, "Property not found", "NOT_FOUND");
  }

  // Check authorization
  if (property.sellerId !== user.id && user.role !== Role.ADMIN) {
    throw new AppError(
      403,
      "You are not authorized to delete this property",
      "UNAUTHORIZED",
    );
  }

  await prisma.property.delete({
    where: { id },
  });

  return { message: "Property deleted successfully" };
};

export const propertyService = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};
