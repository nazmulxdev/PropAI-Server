import { z } from "zod";

export const createReviewSchema = {
  body: z.object({
    rating: z.number().int().min(1).max(5),
    comment: z.string().min(5, "Comment must be at least 5 characters"),
  }),
};

export const updateReviewSchema = {
  body: createReviewSchema.body.partial(),
};
