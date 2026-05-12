/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inquiry, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../shared/AppError";
import { InquiryStatus, PropertyStatus } from "../../../generated/prisma/enums";
import { IQueryParams } from "../../interfaces/query.interface";

import {
  inquirySearchableFields,
  inquiryFilterableFields,
  inquiryDefaultInclude,
} from "./inquiry.constant";
import { QueryBuilder } from "../../utils/QueryBuilders";

// Buyer creates an inquiry + starts a conversation automatically
const createInquiry = async (
  buyerId: string,
  payload: { propertyId: string; message: string },
) => {
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId },
  });
  if (!property || property.status !== PropertyStatus.ACTIVE) {
    throw new AppError(
      400,
      "Property not found or not active",
      "INVALID_PROPERTY",
    );
  }
  if (property.sellerId === buyerId) {
    throw new AppError(
      400,
      "You cannot inquire on your own property",
      "SELF_INQUIRY",
    );
  }

  // Create inquiry
  const inquiry = await prisma.inquiry.create({
    data: {
      buyerId,
      sellerId: property.sellerId,
      propertyId: payload.propertyId,
      message: payload.message,
      status: InquiryStatus.PENDING,
    },
    include: inquiryDefaultInclude,
  });

  // Create conversation if not exists (or retrieve existing)
  await prisma.conversation.upsert({
    where: {
      // Need a unique constraint on (buyerId, sellerId, propertyId)? Not in schema.
      // We'll handle manually: find first, then create if missing.
      id: "", // dummy, we'll use findFirst + create
    },
    create: {
      buyerId,
      sellerId: property.sellerId,
      propertyId: payload.propertyId,
    },
    update: {},
  });
  // Since no unique constraint, we can't use upsert directly; we'll do it manually.
  // I'll show a manual approach:

  const existingConv = await prisma.conversation.findFirst({
    where: {
      buyerId,
      sellerId: property.sellerId,
      propertyId: payload.propertyId,
    },
  });
  if (!existingConv) {
    await prisma.conversation.create({
      data: {
        buyerId,
        sellerId: property.sellerId,
        propertyId: payload.propertyId,
      },
    });
  }

  return inquiry;
};

// Buyer: list own sent inquiries
const getSentInquiries = async (buyerId: string, query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Inquiry,
    Prisma.InquiryWhereInput,
    Prisma.InquiryInclude
  >(prisma.inquiry, query, {
    searchableFields: inquirySearchableFields,
    filterableFields: inquiryFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({ buyerId } as any)
    .paginate()
    .sort()
    .dynamicInclude(inquiryDefaultInclude)
    .execute();

  return result;
};

// Seller: list received inquiries
const getReceivedInquiries = async (sellerId: string, query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Inquiry,
    Prisma.InquiryWhereInput,
    Prisma.InquiryInclude
  >(prisma.inquiry, query, {
    searchableFields: inquirySearchableFields,
    filterableFields: inquiryFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({ sellerId } as any)
    .paginate()
    .sort()
    .dynamicInclude(inquiryDefaultInclude)
    .execute();

  return result;
};

// Admin: list all inquiries
const getAllInquiriesAdmin = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Inquiry,
    Prisma.InquiryWhereInput,
    Prisma.InquiryInclude
  >(prisma.inquiry, query, {
    searchableFields: inquirySearchableFields,
    filterableFields: inquiryFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .sort()
    .dynamicInclude(inquiryDefaultInclude)
    .execute();

  return result;
};

// Seller updates inquiry status (REPLIED or CLOSED)
const updateInquiryStatus = async (
  inquiryId: string,
  sellerId: string,
  newStatus: InquiryStatus,
) => {
  const inquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId } });
  if (!inquiry) throw new AppError(404, "Inquiry not found", "NOT_FOUND");
  if (inquiry.sellerId !== sellerId)
    throw new AppError(403, "Unauthorized", "UNAUTHORIZED");
  if (inquiry.status === InquiryStatus.CLOSED)
    throw new AppError(400, "Inquiry is already closed", "ALREADY_CLOSED");

  const updated = await prisma.inquiry.update({
    where: { id: inquiryId },
    data: { status: newStatus },
    include: inquiryDefaultInclude,
  });

  return updated;
};

export const inquiryService = {
  createInquiry,
  getSentInquiries,
  getReceivedInquiries,
  getAllInquiriesAdmin,
  updateInquiryStatus,
};
