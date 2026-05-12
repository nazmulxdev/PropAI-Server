import { prisma } from "../../lib/prisma.js";
import AppError from "../../shared/AppError.js";

const _recalculatePropertyRating = async (propertyId: string) => {
  const result = await prisma.review.aggregate({
    where: { propertyId },
    _avg: { rating: true },
    _count: { id: true },
  });

  await prisma.property.update({
    where: { id: propertyId },
    data: {
      avgRating: result._avg.rating || 0,
      reviewCount: result._count.id,
    },
  });
};

const addReview = async (
  propertyId: string,
  userId: string,
  data: { rating: number; comment: string },
) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(404, "Property not found", "NOT_FOUND");
  }

  // Check if user has already reviewed
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
  });

  if (existingReview) {
    throw new AppError(
      400,
      "You have already reviewed this property",
      "BAD_REQUEST",
    );
  }

  const review = await prisma.review.create({
    data: {
      propertyId,
      userId,
      rating: data.rating,
      comment: data.comment,
    },
  });

  await _recalculatePropertyRating(propertyId);

  return review;
};

const getReviews = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new AppError(404, "Property not found", "NOT_FOUND");
  }

  const [reviews, breakdown] = await Promise.all([
    prisma.review.findMany({
      where: { propertyId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.groupBy({
      by: ["rating"],
      where: { propertyId },
      _count: { rating: true },
    }),
  ]);

  // Format breakdown
  const ratingBreakdown = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  breakdown.forEach((b) => {
    ratingBreakdown[b.rating as keyof typeof ratingBreakdown] = b._count.rating;
  });

  return { reviews, ratingBreakdown };
};

const updateReview = async (
  reviewId: string,
  userId: string,
  data: { rating?: number; comment?: string },
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(404, "Review not found", "NOT_FOUND");
  }

  if (review.userId !== userId) {
    throw new AppError(
      403,
      "You are not authorized to update this review",
      "UNAUTHORIZED",
    );
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data,
  });

  if (data.rating) {
    await _recalculatePropertyRating(review.propertyId);
  }

  return updatedReview;
};

const deleteReview = async (reviewId: string, userId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(404, "Review not found", "NOT_FOUND");
  }

  if (review.userId !== userId) {
    throw new AppError(
      403,
      "You are not authorized to delete this review",
      "UNAUTHORIZED",
    );
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  await _recalculatePropertyRating(review.propertyId);

  return { message: "Review deleted successfully" };
};

export const reviewService = {
  addReview,
  getReviews,
  updateReview,
  deleteReview,
};
