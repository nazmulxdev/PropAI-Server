import { z } from "zod";

export const createReviewSchema = {
  body: z.object({
    propertyId: z.string().uuid("Invalid property ID"),
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(1, "Comment is required").max(500),
  }),
};

export const updateReviewSchema = {
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().min(1).max(500).optional(),
  }),
};
