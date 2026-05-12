import { Request, Response } from "express";
import catchAsync from "../../shared/CatchAsync.js";
import AppResponse from "../../shared/AppResponse.js";
import { aiService } from "./ai.service.js";

const generateDescription = catchAsync(async (req: Request, res: Response) => {
  const result = await aiService.generatePropertyDescription(req.body);

  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Description generated successfully",
    data: result,
  });
});

const getRecommendations = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await aiService.getAIRecommendations(userId);

  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Recommendations fetched successfully",
    data: result,
  });
});

const chat = catchAsync(async (req: Request, res: Response) => {
  const { message } = req.body;
  const answer = await aiService.chatWithAssistant(message);

  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Assistant replied",
    data: { answer },
  });
});

export const aiController = {
  generateDescription,
  getRecommendations,
  chat,
};
