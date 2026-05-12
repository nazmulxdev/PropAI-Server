/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import catchAsync from "../../shared/CatchAsync";
import AppResponse from "../../shared/AppResponse";
import AppError from "../../shared/AppError";
import { recommendationService } from "./ai.recommendations.service";
import { aiGenerateService } from "./ai.generate.service";
import { aiAnalyzerService } from "./ai.analyzer.service";

const getRecommendations = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw new AppError(401, "Authentication required");
  const data = await recommendationService.getRecommendations(userId);
  AppResponse(res, {
    message: "Recommendations generated",
    statusCode: 200,
    success: true,
    data,
  });
});

// ---------- Property Description ----------
const generatePropertyDescription = catchAsync(
  async (req: Request, res: Response) => {
    const body = req.body;
    // Basic validation
    if (!body.type || !body.city || !body.price) {
      throw new AppError(400, "Missing required fields: type, city, price");
    }
    const data = await aiGenerateService.generatePropertyDescription(body);
    AppResponse(res, {
      message: "Property description generated",
      statusCode: 200,
      success: true,
      data,
    });
  },
);

// ---------- Blog Post ----------
const generateBlogPost = catchAsync(async (req: Request, res: Response) => {
  const { title, keywords } = req.body;
  if (!title) throw new AppError(400, "Title is required");
  const data = await aiGenerateService.generateBlogPost(title, keywords);
  AppResponse(res, {
    message: "Blog post generated",
    statusCode: 200,
    success: true,
    data,
  });
});

// ---------- Property Tags ----------
const generatePropertyTags = catchAsync(async (req: Request, res: Response) => {
  const { title, description } = req.body;
  if (!title || !description)
    throw new AppError(400, "Title and description are required");
  const data = await aiGenerateService.generatePropertyTags(title, description);
  AppResponse(res, {
    message: "Tags generated",
    statusCode: 200,
    success: true,
    data,
  });
});

const analyzeSeller = catchAsync(async (req: Request, res: Response) => {
  const { viewsOverTime, inquiriesPerListing, typeDistribution } = req.body;
  if (!viewsOverTime || !inquiriesPerListing || !typeDistribution) {
    throw new AppError(
      400,
      "Missing required data: viewsOverTime, inquiriesPerListing, typeDistribution",
    );
  }
  const result = await aiAnalyzerService.analyzeSellerData({
    viewsOverTime,
    inquiriesPerListing,
    typeDistribution,
  });
  AppResponse(res, {
    message: "Seller insights generated",
    statusCode: 200,
    success: true,
    data: result,
  });
});

const analyzeAdmin = catchAsync(async (req: Request, res: Response) => {
  const { usersOverTime, listingsPerCity, typeDistribution, inquiriesPerDay } =
    req.body;
  if (
    !usersOverTime ||
    !listingsPerCity ||
    !typeDistribution ||
    !inquiriesPerDay
  ) {
    throw new AppError(400, "Missing required data");
  }
  const result = await aiAnalyzerService.analyzeAdminData({
    usersOverTime,
    listingsPerCity,
    typeDistribution,
    inquiriesPerDay,
  });
  AppResponse(res, {
    message: "Admin insights generated",
    statusCode: 200,
    success: true,
    data: result,
  });
});

export const aiController = {
  getRecommendations,
  generatePropertyDescription,
  generateBlogPost,
  generatePropertyTags,
  analyzeSeller,
  analyzeAdmin,
};
