import { z } from "zod";
import { InquiryStatus } from "../../../generated/prisma/enums.js";

export const createInquirySchema = {
  body: z.object({
    propertyId: z.string().uuid("Invalid Property ID"),
    message: z.string().min(10, "Message must be at least 10 characters"),
  }),
};

export const updateInquiryStatusSchema = {
  body: z.object({
    status: z.nativeEnum(InquiryStatus),
  }),
};
