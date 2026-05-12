import { Request, Response } from "express";
import catchAsync from "../../shared/CatchAsync.js";
import AppResponse from "../../shared/AppResponse.js";
import { reviewService } from "./review.service.js";

const addReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const propertyId = req.params.propertyId as string;
  const review = await reviewService.addReview(propertyId, userId, req.body);

  AppResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review added successfully",
    data: { review },
  });
});

const getReviews = catchAsync(async (req: Request, res: Response) => {
  const propertyId = req.params.propertyId as string;
  const result = await reviewService.getReviews(propertyId);

  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews fetched successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const reviewId = req.params.id as string;
  const review = await reviewService.updateReview(reviewId, userId, req.body);

  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review updated successfully",
    data: { review },
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const reviewId = req.params.id as string;
  const result = await reviewService.deleteReview(reviewId, userId);

  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review deleted successfully",
    data: result,
  });
});

export const reviewController = {
  addReview,
  getReviews,
  updateReview,
  deleteReview,
};
