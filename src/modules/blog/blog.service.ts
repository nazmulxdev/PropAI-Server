/* eslint-disable @typescript-eslint/no-explicit-any */
import { Blog, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../shared/AppError";
import { BlogStatus } from "../../../generated/prisma/enums";
import { IQueryParams } from "../../interfaces/query.interface";

import {
  blogSearchableFields,
  blogFilterableFields,
  blogDefaultInclude,
} from "./blog.constant";
import { QueryBuilder } from "../../utils/QueryBuilders";

const createBlog = async (authorId: string, payload: any) => {
  return prisma.blog.create({
    data: { ...payload, authorId },
    include: blogDefaultInclude,
  });
};

// Public: only published blogs
const getAllBlogsPublic = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Blog,
    Prisma.BlogWhereInput,
    Prisma.BlogInclude
  >(prisma.blog, query, {
    searchableFields: blogSearchableFields,
    filterableFields: blogFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .where({ status: BlogStatus.PUBLISHED } as any)
    .paginate()
    .sort()
    .dynamicInclude(blogDefaultInclude)
    .execute();

  return result;
};

// Admin: all blogs (any status)
const getAllBlogsAdmin = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Blog,
    Prisma.BlogWhereInput,
    Prisma.BlogInclude
  >(prisma.blog, query, {
    searchableFields: blogSearchableFields,
    filterableFields: blogFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .sort()
    .dynamicInclude(blogDefaultInclude)
    .execute();

  return result;
};

const getBlogById = async (id: string) => {
  const blog = await prisma.blog.findUnique({
    where: { id },
    include: blogDefaultInclude,
  });
  if (!blog) throw new AppError(404, "Blog not found", "NOT_FOUND");

  // increment views asynchronously
  prisma.blog
    .update({ where: { id }, data: { views: { increment: 1 } } })
    .catch(console.error);

  return blog;
};

const updateBlog = async (id: string, payload: any) => {
  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog) throw new AppError(404, "Blog not found", "NOT_FOUND");

  return prisma.blog.update({
    where: { id },
    data: payload,
    include: blogDefaultInclude,
  });
};

const deleteBlog = async (id: string) => {
  const blog = await prisma.blog.findUnique({ where: { id } });
  if (!blog) throw new AppError(404, "Blog not found", "NOT_FOUND");
  await prisma.blog.delete({ where: { id } });
  return { message: "Blog deleted" };
};

export const blogService = {
  createBlog,
  getAllBlogsPublic,
  getAllBlogsAdmin,
  getBlogById,
  updateBlog,
  deleteBlog,
};
