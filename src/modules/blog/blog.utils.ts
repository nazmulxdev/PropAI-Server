import { NextFunction, Request, Response } from "express";

// For creating a blog (cover image optional)
export const fileUploaderMiddlewareForCreate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.body.data) {
    req.body = JSON.parse(req.body.data);
  }

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[] | undefined;
  };

  if (files?.coverImage && files.coverImage.length > 0) {
    req.body.coverImage = files.coverImage[0].path; // Cloudinary URL
  }

  next();
};

// For updating a blog (cover image optional, replace if provided)
export const fileUploaderMiddlewareForUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.body.data) {
    req.body = JSON.parse(req.body.data);
  }

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[] | undefined;
  };

  if (files?.coverImage && files.coverImage.length > 0) {
    req.body.coverImage = files.coverImage[0].path;
  }

  next();
};

export const blogUtils = {
  fileUploaderMiddlewareForCreate,
  fileUploaderMiddlewareForUpdate,
};
