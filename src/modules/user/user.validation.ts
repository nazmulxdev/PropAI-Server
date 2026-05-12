import { z } from "zod";
import { Role, UserStatus } from "../../../generated/prisma/enums";

export const updateUserStatusSchema = {
  body: z.object({
    status: z.nativeEnum(UserStatus),
    reason: z.string().optional(),
  }),
};

export const updateUserRoleSchema = {
  body: z.object({
    role: z.nativeEnum(Role),
  }),
};
