import { Request, Response } from "express";
import catchAsync from "../../shared/CatchAsync";
import AppResponse from "../../shared/AppResponse";
import { inquiryService } from "./inquiry.service";
import { IQueryParams } from "../../interfaces/query.interface";

export const createInquiry = catchAsync(async (req: Request, res: Response) => {
  const buyerId = req.user!.id;
  const inquiry = await inquiryService.createInquiry(buyerId, req.body);
  AppResponse(res, {
    statusCode: 201,
    success: true,
    message: "Inquiry sent",
    data: { inquiry },
  });
});

export const getSentInquiries = catchAsync(
  async (req: Request, res: Response) => {
    const buyerId = req.user!.id;
    const result = await inquiryService.getSentInquiries(
      buyerId,
      req.query as IQueryParams,
    );
    AppResponse(res, {
      statusCode: 200,
      success: true,
      message: "Sent inquiries fetched",
      data: result.data,
      meta: result.meta,
    });
  },
);

export const getReceivedInquiries = catchAsync(
  async (req: Request, res: Response) => {
    const sellerId = req.user!.id;
    const result = await inquiryService.getReceivedInquiries(
      sellerId,
      req.query as IQueryParams,
    );
    AppResponse(res, {
      statusCode: 200,
      success: true,
      message: "Received inquiries fetched",
      data: result.data,
      meta: result.meta,
    });
  },
);

export const getAllInquiriesAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await inquiryService.getAllInquiriesAdmin(
      req.query as IQueryParams,
    );
    AppResponse(res, {
      statusCode: 200,
      success: true,
      message: "All inquiries fetched",
      data: result.data,
      meta: result.meta,
    });
  },
);

export const updateInquiryStatus = catchAsync(
  async (req: Request, res: Response) => {
    const sellerId = req.user!.id;
    const inquiryId = req.params.id as string;
    const { status } = req.body;
    const inquiry = await inquiryService.updateInquiryStatus(
      inquiryId,
      sellerId,
      status,
    );
    AppResponse(res, {
      statusCode: 200,
      success: true,
      message: `Inquiry marked as ${status}`,
      data: { inquiry },
    });
  },
);
