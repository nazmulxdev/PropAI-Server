import { NextFunction, Request, Response } from "express";
import { ICreateProperty } from "./property.interface";

const fileuploaderMiddlewareForCreate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.body.data) {
    req.body = JSON.parse(req.body.data);
  }

  console.log(req.body);

  const payload: ICreateProperty = req.body;

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[] | undefined;
  };

  console.log(files);

  if (files.images && files.images.length > 0) {
    payload.images = files.images.map((file) => file.path);
  }

  next();
};

const fileuploaderMiddlewareForUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.body.data) {
    req.body = JSON.parse(req.body.data);
  }

  const payload: Partial<ICreateProperty> = req.body;

  const files = req.files as {
    [fieldname: string]: Express.Multer.File[] | undefined;
  };

  console.log(files);

  if (files.images && files.images.length > 0) {
    payload.images = files.images.map((file) => file.path);
  }

  next();
};

export const propertyUtils = {
  fileuploaderMiddlewareForCreate,
  fileuploaderMiddlewareForUpdate,
};
