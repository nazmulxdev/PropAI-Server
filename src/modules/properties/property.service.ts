/* eslint-disable no-useless-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../../lib/prisma.js";
import AppError from "../../shared/AppError.js";
import { Prisma, Property } from "../../../generated/prisma/client.js";
import { Role, PropertyStatus } from "../../../generated/prisma/enums.js";
import { QueryBuilder } from "../../utils/QueryBuilders.js";
import {
  propertyDefaultInclude,
  propertyFilterableFields,
  propertySearchableFields,
} from "./property.constant.js";
import { IQueryParams } from "../../interfaces/query.interface.js";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config.js";

const createProperty = async (data: any, sellerId: string) => {
  const property = await prisma.property.create({
    data: {
      ...data,
      sellerId,
      status: PropertyStatus.PENDING,
    },
  });

  return property;
};

// public active properties listing only
const getProperties = async (query: IQueryParams) => {
  // Convert minPrice, maxPrice, search into standard filter format
  if (query.minPrice) {
    query["price[gte]"] = query.minPrice;
    delete query.minPrice;
  }
  if (query.maxPrice) {
    query["price[lte]"] = query.maxPrice;
    delete query.maxPrice;
  }
  if (query.search) {
    query.searchTerm = query.search;
    delete query.search;
  }

  const queryBuilder = new QueryBuilder<
    Property,
    Prisma.PropertyWhereInput,
    Prisma.PropertyInclude
  >(prisma.property, query, {
    searchableFields: propertySearchableFields,
    filterableFields: propertyFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({ status: PropertyStatus.ACTIVE } as any)
    .paginate()
    .sort()
    .dynamicInclude(propertyDefaultInclude)
    .execute();

  return result;
};

// ============ SELLER: MY LISTINGS (any status) ============
const getMyListings = async (sellerId: string, query: IQueryParams) => {
  if (query.minPrice) {
    query["price[gte]"] = query.minPrice;
    delete query.minPrice;
  }
  if (query.maxPrice) {
    query["price[lte]"] = query.maxPrice;
    delete query.maxPrice;
  }

  const queryBuilder = new QueryBuilder<
    Property,
    Prisma.PropertyWhereInput,
    Prisma.PropertyInclude
  >(prisma.property, query, {
    searchableFields: propertySearchableFields,
    filterableFields: propertyFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({ sellerId } as any)
    .paginate()
    .sort()
    .dynamicInclude(propertyDefaultInclude)
    .execute();

  return result;
};

// ============ ADMIN: ALL PROPERTIES (any status) ============
const getAllPropertiesAdmin = async (query: IQueryParams) => {
  if (query.minPrice) {
    query["price[gte]"] = query.minPrice;
    delete query.minPrice;
  }
  if (query.maxPrice) {
    query["price[lte]"] = query.maxPrice;
    delete query.maxPrice;
  }
  if (query.search) {
    query.searchTerm = query.search;
    delete query.search;
  }

  const queryBuilder = new QueryBuilder<
    Property,
    Prisma.PropertyWhereInput,
    Prisma.PropertyInclude
  >(prisma.property, query, {
    searchableFields: propertySearchableFields,
    filterableFields: propertyFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .sort()
    .dynamicInclude(propertyDefaultInclude)
    .execute();

  return result;
};

// ============ SINGLE PROPERTY ============
const getPropertyById = async (id: string) => {
  const property = await prisma.property.findFirst({
    where: { id },
    include: {
      seller: { select: { id: true, name: true, image: true, email: true } },
      reviews: true,
      _count: { select: { savedProperties: true, inquiries: true } },
    },
  });

  if (!property) {
    throw new AppError(404, "Property not found", "NOT_FOUND");
  }

  // increment view count asynchronously
  prisma.property
    .update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(console.error);

  return property;
};

// ============ UPDATE ============
const updateProperty = async (
  id: string,
  data: any,
  user: { id: string; role: string },
) => {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) throw new AppError(404, "Property not found", "NOT_FOUND");

  if (property.sellerId !== user.id && user.role !== Role.ADMIN) {
    throw new AppError(403, "Unauthorized", "UNAUTHORIZED");
  }

  return prisma.property.update({ where: { id }, data });
};

// ============ DELETE ============
const deleteProperty = async (
  id: string,
  user: { id: string; role: string },
) => {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) throw new AppError(404, "Property not found", "NOT_FOUND");

  if (property.sellerId !== user.id && user.role !== Role.ADMIN) {
    throw new AppError(403, "Unauthorized", "UNAUTHORIZED");
  }
  if (property.images?.length) {
    await Promise.all(
      property.images.map((url) => deleteFileFromCloudinary(url as string)),
    );
  }

  await prisma.property.delete({ where: { id } });
  return { message: "Property deleted successfully" };
};

// ============ ADMIN: CHANGE STATUS ============
const updatePropertyStatus = async (propertyId: string, status: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });
  if (!property) throw new AppError(404, "Property not found", "NOT_FOUND");

  return prisma.property.update({
    where: { id: propertyId },
    data: {
      status: status as PropertyStatus,
    },
  });
};

// ============ SAVE / UNSAVE PROPERTY (toggle) ============
const toggleSaveProperty = async (userId: string, propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });
  if (!property) throw new AppError(404, "Property not found", "NOT_FOUND");

  const existing = await prisma.savedProperty.findUnique({
    where: { userId_propertyId: { userId, propertyId } },
  });

  if (existing) {
    await prisma.savedProperty.delete({ where: { id: existing.id } });
    return { saved: false };
  } else {
    await prisma.savedProperty.create({ data: { userId, propertyId } });
    return { saved: true };
  }
};

// ============ GET SAVED PROPERTIES (buyer) ============
const getSavedProperties = async (userId: string, query: IQueryParams) => {
  // This is a list of saved properties for the current user
  const queryBuilder = new QueryBuilder<any, any, any>(
    prisma.savedProperty,
    query,
    {
      searchableFields: [], // we can search by property title etc? Not needed; but we can always include property data
    },
  );

  const result = await queryBuilder
    .where({ userId } as any)
    .include({
      property: {
        include: {
          seller: { select: { id: true, name: true, image: true } },
        },
      },
    } as any)
    .execute();

  // result contains savedProperty entries, we may want to map to just properties
  return {
    data: result.data.map((sp: any) => sp.property),
    meta: result.meta,
  };
};

// ============ RECORD VIEW (for AI recommendations) ============
const recordPropertyView = async (userId: string, propertyId: string) => {
  // Ensure property exists
  await prisma.property.findUniqueOrThrow({ where: { id: propertyId } });

  await prisma.browsingHistory.create({
    data: { userId, propertyId },
  });

  return { recorded: true };
};

export const propertyService = {
  createProperty,
  getProperties,
  getMyListings,
  getAllPropertiesAdmin,
  getPropertyById,
  updateProperty,
  deleteProperty,
  updatePropertyStatus,
  toggleSaveProperty,
  getSavedProperties,
  recordPropertyView,
};
