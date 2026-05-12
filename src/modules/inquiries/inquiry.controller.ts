import { Request, Response } from "express";
import catchAsync from "../../shared/CatchAsync.js";
import AppResponse from "../../shared/AppResponse.js";
import { inquiryService } from "./inquiry.service.js";

const sendInquiry = catchAsync(async (req: Request, res: Response) => {
  const buyerId = req.user!.id;
  const { propertyId, message } = req.body;
  const inquiry = await inquiryService.sendInquiry(buyerId, propertyId, message);

  AppResponse(res, {
    statusCode: 201,
    success: true,
    message: "Inquiry sent successfully",
    data: { inquiry },
  });
});

const getBuyerInquiries = catchAsync(async (req: Request, res: Response) => {
  const buyerId = req.user!.id;
  const inquiries = await inquiryService.getBuyerInquiries(buyerId);

  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Inquiries fetched successfully",
    data: { inquiries },
  });
});

const getSellerInquiries = catchAsync(async (req: Request, res: Response) => {
  const sellerId = req.user!.id;
  const inquiries = await inquiryService.getSellerInquiries(sellerId);

  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Received inquiries fetched successfully",
    data: { inquiries },
  });
});

const updateInquiryStatus = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;
  const inquiryId = req.params.id as string;
  const { status } = req.body;

  const inquiry = await inquiryService.updateInquiryStatus(inquiryId, status, userId, role);

  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Inquiry status updated successfully",
    data: { inquiry },
  });
});

const getConversationByInquiryId = catchAsync(async (req: Request, res: Response) => {
  const inquiryId = req.params.id as string;
  const conversation = await inquiryService.getConversationByInquiryId(inquiryId);

  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Conversation fetched successfully",
    data: { conversation },
  });
});

const getMessagesByConversationId = catchAsync(async (req: Request, res: Response) => {
  const conversationId = req.params.id as string;
  const messages = await inquiryService.getMessagesByConversationId(conversationId);

  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Messages fetched successfully",
    data: { messages },
  });
});

export const inquiryController = {
  sendInquiry,
  getBuyerInquiries,
  getSellerInquiries,
  updateInquiryStatus,
  getConversationByInquiryId,
  getMessagesByConversationId,
};
