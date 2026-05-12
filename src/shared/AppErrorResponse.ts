import { Request, Response } from "express";
import { config } from "../config/env";

interface IErrorDetail {
  field?: string;
  message: string;
}

interface IErrorResponse {
  statusCode: number;
  name: string;
  code?: string;
  message: string;
  details?: IErrorDetail[];
  stack?: string;
  isOperational?: boolean;
}

const AppErrorResponse = (
  req: Request,
  res: Response,
  error: IErrorResponse,
  path?: string,
) => {
  const isDev = config.NODE_ENV === "development";

  return res.status(error.statusCode).json({
    success: false,
    error: {
      code: error.code || error.name || "INTERNAL_SERVER_ERROR",
      message: error.message,
      ...(error.details !== undefined &&
        error.details.length > 0 && { details: error.details }),
    },
    ...(isDev && { stack: error.stack }),
    path,
  });
};

export default AppErrorResponse;

export type { IErrorResponse, IErrorDetail };
