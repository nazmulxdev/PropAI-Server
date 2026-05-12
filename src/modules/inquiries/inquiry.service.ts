import { prisma } from "../../lib/prisma.js";
import AppError from "../../shared/AppError.js";
import { InquiryStatus, Role } from "../../../generated/prisma/enums.js";
import { notificationService } from "../notifications/notification.service.js";

const sendInquiry = async (
  buyerId: string,
  propertyId: string,
  message: string,
) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { sellerId: true, title: true },
  });

  if (!property) {
    throw new AppError(404, "Property not found", "NOT_FOUND");
  }

  if (property.sellerId === buyerId) {
    throw new AppError(
      400,
      "You cannot inquire about your own property",
      "BAD_REQUEST",
    );
  }

  // Find or create conversation
  let conversation = await prisma.conversation.findFirst({
    where: {
      propertyId,
      buyerId,
      sellerId: property.sellerId,
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        propertyId,
        buyerId,
        sellerId: property.sellerId,
      },
    });
  }

  // Create Inquiry and Message in a transaction
  const [inquiry] = await prisma.$transaction([
    prisma.inquiry.create({
      data: {
        propertyId,
        buyerId,
        sellerId: property.sellerId,
        message,
        status: InquiryStatus.PENDING,
      },
    }),
    prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: buyerId,
        content: `Inquiry about ${property.title}: ${message}`,
      },
    }),
  ]);

  // Trigger notification for seller
  notificationService
    .createNotification(
      property.sellerId,
      "INQUIRY",
      "New Inquiry Received",
      `A buyer has inquired about your property: ${property.title}`,
      `/dashboard/inquiries/${inquiry.id}`,
    )
    .catch(console.error);

  return inquiry;
};

const getBuyerInquiries = async (buyerId: string) => {
  return await prisma.inquiry.findMany({
    where: { buyerId },
    include: {
      property: {
        select: { title: true, images: true, city: true },
      },
      seller: {
        select: { name: true, image: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getSellerInquiries = async (sellerId: string) => {
  return await prisma.inquiry.findMany({
    where: { sellerId },
    include: {
      property: {
        select: { title: true, images: true, city: true },
      },
      buyer: {
        select: { name: true, image: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const updateInquiryStatus = async (
  inquiryId: string,
  status: InquiryStatus,
  userId: string,
  role: string,
) => {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
  });

  if (!inquiry) {
    throw new AppError(404, "Inquiry not found", "NOT_FOUND");
  }

  // Only seller of the property or admin can update status
  if (inquiry.sellerId !== userId && role !== Role.ADMIN) {
    throw new AppError(403, "Not authorized to update this inquiry", "UNAUTHORIZED");
  }

  return await prisma.inquiry.update({
    where: { id: inquiryId },
    data: { status },
  });
};

const getConversationByInquiryId = async (inquiryId: string) => {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id: inquiryId },
    select: { propertyId: true, buyerId: true, sellerId: true },
  });

  if (!inquiry) {
    throw new AppError(404, "Inquiry not found", "NOT_FOUND");
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      propertyId: inquiry.propertyId,
      buyerId: inquiry.buyerId,
      sellerId: inquiry.sellerId,
    },
    include: {
      property: { select: { id: true, title: true } },
      buyer: { select: { id: true, name: true, image: true } },
      seller: { select: { id: true, name: true, image: true } },
    },
  });

  return conversation;
};

const getMessagesByConversationId = async (conversationId: string) => {
  return await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, image: true } },
    },
  });
};

export const inquiryService = {
  sendInquiry,
  getBuyerInquiries,
  getSellerInquiries,
  updateInquiryStatus,
  getConversationByInquiryId,
  getMessagesByConversationId,
};
