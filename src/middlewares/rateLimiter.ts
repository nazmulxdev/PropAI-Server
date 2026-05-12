/* eslint-disable @typescript-eslint/no-explicit-any */
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redisService } from "../lib/redis";
import type { Request } from "express";
import AppResponse from "../shared/AppResponse";

interface RateLimitOptions {
  windowMs: number;
  max: number;
  key?: string;
  skipSuccessfulRequests?: boolean;
}

export const createLimiter = (options: RateLimitOptions) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests ?? false,

    keyGenerator: (req: Request) => {
      const user = (req as Request & { user?: { id: string } }).user;
      return user?.id ?? ipKeyGenerator(req as any);
    },

    store: new RedisStore({
      sendCommand: (...args: string[]) => {
        const client = redisService.getRawClient();
        if (!client || !redisService.isConnectedCheck()) {
          return Promise.reject(new Error("Redis not available"));
        }

        return client.sendCommand(args);
      },
      prefix: options.key ? `rl:${options.key}:` : "rl:",
    }),

    // If Redis is down, skip limiting entirely (fail open).
    skip: () => !redisService.isConnectedCheck(),

    handler: (_req, res) => {
      AppResponse(res, {
        message: "Too many requests. Please try again later some times later.",
        statusCode: 429,
        success: false,
        data: null,
      });
    },
  });
};
