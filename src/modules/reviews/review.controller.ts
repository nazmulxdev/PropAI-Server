import { Request, Response } from "express";
import catchAsync from "../../shared/CatchAsync";
import AppResponse from "../../shared/AppResponse";
import { reviewService } from "./review.service";
import { IQueryParams } from "../../interfaces/query.interface";

export const createReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const review = await reviewService.createReview(userId, req.body);
  AppResponse(res, {
    statusCode: 201,
    success: true,
    message: "Review submitted",
    data: { review },
  });
});

export const getReviewsByProperty = catchAsync(
  async (req: Request, res: Response) => {
    const propertyId = req.params.propertyId as string;
    const result = await reviewService.getReviewsByProperty(
      propertyId,
      req.query as IQueryParams,
    );
    AppResponse(res, {
      statusCode: 200,
      success: true,
      message: "Reviews fetched",
      data: result.data,
      meta: result.meta,
    });
  },
);

export const updateReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const reviewId = req.params.id as string;
  const review = await reviewService.updateReview(reviewId, userId, req.body);
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review updated",
    data: { review },
  });
});

export const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const userRole = req.user!.role as string;
  const reviewId = req.params.id as string;
  const result = await reviewService.deleteReview(reviewId, userId, userRole);
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Review deleted",
    data: result,
  });
});
