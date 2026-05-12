import { createLimiter } from "../middlewares/rateLimiter";

export const globalLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 30,
  key: "global",
});

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  key: "auth",
});

export const aiLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 10,
  key: "ai",
});

export const uploadLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 30,
  key: "upload",
});

export const ragQueryLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 30,
  key: "rag",
  skipSuccessfulRequests: true,
});
