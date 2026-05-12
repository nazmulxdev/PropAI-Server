import { z } from "zod";
import { BlogStatus } from "../../../generated/prisma/enums";

export const createBlogSchema = {
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    content: z.string().min(20, "Content must be at least 20 characters"),
    coverImage: z.string().url().optional(),
    tags: z.array(z.string()).optional(),
    status: z.nativeEnum(BlogStatus).optional().default(BlogStatus.DRAFT),
  }),
};

export const updateBlogSchema = {
  body: createBlogSchema.body.partial(),
};

export const blogQuerySchema = {
  query: z.object({
    searchTerm: z.string().optional(),
    status: z.nativeEnum(BlogStatus).optional(),
    authorId: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sortBy: z
      .enum(["createdAt_desc", "createdAt_asc", "views_desc"])
      .optional(),
  }),
};
