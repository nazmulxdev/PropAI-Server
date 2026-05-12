import { Request, Response } from "express";
import catchAsync from "../../shared/CatchAsync";
import AppResponse from "../../shared/AppResponse";
import { blogService } from "./blog.service";
import { IQueryParams } from "../../interfaces/query.interface";

export const createBlog = catchAsync(async (req: Request, res: Response) => {
  const authorId = req.user!.id;
  const blog = await blogService.createBlog(authorId, req.body);
  AppResponse(res, {
    statusCode: 201,
    success: true,
    message: "Blog created",
    data: { blog },
  });
});

export const getAllBlogsPublic = catchAsync(
  async (req: Request, res: Response) => {
    const result = await blogService.getAllBlogsPublic(
      req.query as IQueryParams,
    );
    AppResponse(res, {
      statusCode: 200,
      success: true,
      message: "Blogs fetched",
      data: result.data,
      meta: result.meta,
    });
  },
);

export const getAllBlogsAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const result = await blogService.getAllBlogsAdmin(
      req.query as IQueryParams,
    );
    AppResponse(res, {
      statusCode: 200,
      success: true,
      message: "All blogs fetched",
      data: result.data,
      meta: result.meta,
    });
  },
);

export const getBlogById = catchAsync(async (req: Request, res: Response) => {
  const blog = await blogService.getBlogById(req.params.id as string);
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Blog fetched",
    data: { blog },
  });
});

export const updateBlog = catchAsync(async (req: Request, res: Response) => {
  const blog = await blogService.updateBlog(req.params.id as string, req.body);
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Blog updated",
    data: { blog },
  });
});

export const deleteBlog = catchAsync(async (req: Request, res: Response) => {
  const result = await blogService.deleteBlog(req.params.id as string);
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Blog deleted",
    data: result,
  });
});
