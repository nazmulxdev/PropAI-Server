import { z } from "zod";
import { InquiryStatus } from "../../../generated/prisma/enums";

export const createInquirySchema = {
  body: z.object({
    propertyId: z.string().uuid("Invalid property ID"),
    message: z.string().min(1, "Message is required").max(1000),
  }),
};

export const updateInquiryStatusSchema = {
  body: z.object({
    status: z.enum([InquiryStatus.REPLIED, InquiryStatus.CLOSED]),
  }),
};
