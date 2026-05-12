/* eslint-disable @typescript-eslint/no-explicit-any */
import { Review, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../shared/AppError";
import { IQueryParams } from "../../interfaces/query.interface";

import {
  reviewSearchableFields,
  reviewFilterableFields,
  reviewDefaultInclude,
} from "./review.constant";
import { QueryBuilder } from "../../utils/QueryBuilders";

// Recalculate property's avgRating and reviewCount
async function recalcPropertyRating(propertyId: string) {
  const aggregate = await prisma.review.aggregate({
    where: { propertyId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.property.update({
    where: { id: propertyId },
    data: {
      avgRating: aggregate._avg.rating ?? 0,
      reviewCount: aggregate._count,
    },
  });
}

const createReview = async (
  userId: string,
  payload: { propertyId: string; rating: number; comment: string },
) => {
  // Check if property exists and is active
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId },
  });
  if (!property || property.status !== "ACTIVE")
    throw new AppError(
      400,
      "Property not found or not active",
      "INVALID_PROPERTY",
    );

  // Check duplicate review
  const existing = await prisma.review.findUnique({
    where: { userId_propertyId: { userId, propertyId: payload.propertyId } },
  });
  if (existing)
    throw new AppError(
      409,
      "You have already reviewed this property",
      "DUPLICATE",
    );

  const review = await prisma.review.create({
    data: { ...payload, userId },
    include: reviewDefaultInclude,
  });

  await recalcPropertyRating(payload.propertyId);
  return review;
};

const getReviewsByProperty = async (
  propertyId: string,
  query: IQueryParams,
) => {
  const queryBuilder = new QueryBuilder<
    Review,
    Prisma.ReviewWhereInput,
    Prisma.ReviewInclude
  >(prisma.review, query, {
    searchableFields: reviewSearchableFields,
    filterableFields: reviewFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({ propertyId } as any)
    .paginate()
    .sort()
    .dynamicInclude(reviewDefaultInclude)
    .execute();

  return result;
};

const updateReview = async (
  reviewId: string,
  userId: string,
  payload: { rating?: number; comment?: string },
) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError(404, "Review not found", "NOT_FOUND");
  if (review.userId !== userId)
    throw new AppError(
      403,
      "You can only edit your own review",
      "UNAUTHORIZED",
    );

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: payload,
    include: reviewDefaultInclude,
  });

  await recalcPropertyRating(review.propertyId);
  return updated;
};

const deleteReview = async (
  reviewId: string,
  userId: string,
  userRole: string,
) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new AppError(404, "Review not found", "NOT_FOUND");
  if (review.userId !== userId && userRole !== "ADMIN")
    throw new AppError(403, "Unauthorized", "UNAUTHORIZED");

  await prisma.review.delete({ where: { id: reviewId } });
  await recalcPropertyRating(review.propertyId);
  return { message: "Review deleted" };
};

export const reviewService = {
  createReview,
  getReviewsByProperty,
  updateReview,
  deleteReview,
};
