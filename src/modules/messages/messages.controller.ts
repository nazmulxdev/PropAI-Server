/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import catchAsync from "../../shared/CatchAsync";
import AppResponse from "../../shared/AppResponse";
import { messageService } from "./messages.service";

const getConversations = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const conversations = await messageService.getConversations(userId);
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Conversations fetched",
    data: { conversations },
  });
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const conversationId = req.params.conversationId as string;
  const { before, limit } = req.query as any;
  const messages = await messageService.getMessages(
    conversationId,
    userId,
    before,
    limit,
  );
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Messages fetched",
    data: { messages },
  });
});

const markConversationAsRead = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const conversationId = req.params.conversationId as string;
    const result = await messageService.markConversationAsRead(
      conversationId,
      userId,
    );
    AppResponse(res, {
      statusCode: 200,
      success: true,
      message: "Marked as read",
      data: result,
    });
  },
);

export const messageController = {
  getConversations,
  getMessages,
  markConversationAsRead,
};
