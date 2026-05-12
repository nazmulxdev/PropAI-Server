import { User, Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../shared/AppError";
import { UserStatus, Role } from "../../../generated/prisma/enums";
import { IQueryParams } from "../../interfaces/query.interface";

import { userSearchableFields, userFilterableFields } from "./user.constant";
import { QueryBuilder } from "../../utils/QueryBuilders";

// Admin: list all users with filters & search
const getAllUsers = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    User,
    Prisma.UserWhereInput,
    Prisma.UserInclude
  >(prisma.user, query, {
    searchableFields: userSearchableFields,
    filterableFields: userFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .paginate()
    .sort()
    .execute();

  return result;
};

// Admin: get single user by ID
const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      userStatus: true,
      phone: true,
      bio: true,
      avatar: true,
      preferredTypes: true,
      priceRangeMin: true,
      priceRangeMax: true,
      agencyName: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          properties: true,
          reviews: true,
        },
      },
    },
  });

  if (!user) throw new AppError(404, "User not found", "NOT_FOUND");
  return user;
};

// Admin: ban or unban user
const updateUserStatus = async (
  adminId: string,
  targetUserId: string,
  status: UserStatus,
) => {
  if (adminId === targetUserId)
    throw new AppError(
      400,
      "You cannot change your own status",
      "SELF_OPERATION",
    );

  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) throw new AppError(404, "User not found", "NOT_FOUND");

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { userStatus: status },
    select: { id: true, name: true, email: true, role: true, userStatus: true },
  });

  // Optional: also invalidate their sessions (Better Auth handles session via database, we can delete sessions)
  if (status === UserStatus.BANNED) {
    await prisma.session.deleteMany({ where: { userId: targetUserId } });
  }

  return updated;
};

// Admin: change user role
const updateUserRole = async (
  adminId: string,
  targetUserId: string,
  newRole: Role,
) => {
  if (adminId === targetUserId)
    throw new AppError(
      400,
      "You cannot change your own role",
      "SELF_OPERATION",
    );

  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) throw new AppError(404, "User not found", "NOT_FOUND");

  // Prevent demoting the last admin
  if (user.role === Role.ADMIN && newRole !== Role.ADMIN) {
    const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
    if (adminCount <= 1)
      throw new AppError(400, "Cannot remove the last admin", "LAST_ADMIN");
  }

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
    select: { id: true, name: true, email: true, role: true, userStatus: true },
  });

  return updated;
};

// Admin: hard delete user and all their data
const deleteUser = async (adminId: string, targetUserId: string) => {
  if (adminId === targetUserId)
    throw new AppError(400, "You cannot delete yourself", "SELF_OPERATION");

  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) throw new AppError(404, "User not found", "NOT_FOUND");

  // Optional: prevent deleting last admin
  if (user.role === Role.ADMIN) {
    const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
    if (adminCount <= 1)
      throw new AppError(400, "Cannot delete the last admin", "LAST_ADMIN");
  }

  // Hard delete will cascade to all related data due to onDelete: Cascade in schema
  await prisma.user.delete({ where: { id: targetUserId } });

  return { message: "User and all associated data permanently deleted" };
};

export const userService = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
};
