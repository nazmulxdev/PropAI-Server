import { Request, Response } from "express";
import catchAsync from "../../shared/CatchAsync";
import AppResponse from "../../shared/AppResponse";
import { userService } from "./user.service";
import { IQueryParams } from "../../interfaces/query.interface";

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.getAllUsers(req.query as IQueryParams);
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id as string);
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "User fetched successfully",
    data: { user },
  });
});

export const updateUserStatus = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.user!.id;
    const targetUserId = req.params.id as string;
    const { status } = req.body;
    const user = await userService.updateUserStatus(
      adminId,
      targetUserId,
      status,
    );
    AppResponse(res, {
      statusCode: 200,
      success: true,
      message: `User status updated to ${status}`,
      data: { user },
    });
  },
);

export const updateUserRole = catchAsync(
  async (req: Request, res: Response) => {
    const adminId = req.user!.id;
    const targetUserId = req.params.id as string;
    const { role } = req.body;
    const user = await userService.updateUserRole(adminId, targetUserId, role);
    AppResponse(res, {
      statusCode: 200,
      success: true,
      message: `User role updated to ${role}`,
      data: { user },
    });
  },
);

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const adminId = req.user!.id;
  const targetUserId = req.params.id as string;
  const result = await userService.deleteUser(adminId, targetUserId);
  AppResponse(res, {
    statusCode: 200,
    success: true,
    message: "User deleted permanently",
    data: result,
  });
});
