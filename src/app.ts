import cors from "cors";
import cookieParser from "cookie-parser";
import qs from "qs";
import type { Application, NextFunction, Request, Response } from "express";
import express from "express";
import globalErrorHandler from "./middlewares/GlobalErrors";
import { toNodeHandler } from "better-auth/node";
import notFoundError from "./middlewares/NotFound";
import { auth } from "./lib/auth";
import { indexRoutes } from "./routes";
import { authLimiter, globalLimiter } from "./shared/apiRate";

const app: Application = express();

app.set("trust proxy", true);

app.set("query parser", (str: string) => {
  return qs.parse(str);
});

app.use(
  cors({
    origin: ["http://localhost:5000", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
);

// cookie-parser
app.use(cookieParser());

// auth limiter

app.use("/api/auth/*splat", authLimiter);

// better-auth api routes
app.all(
  "/api/auth/*splat",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await toNodeHandler(auth)(req, res);
    } catch (err) {
      next(err);
    }
  },
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api/v1", globalLimiter);

app.use("/api/v1", indexRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the PropAI API.",
    success: true,
    docs: "/api/v1/docs",
    status: "Running",
  });
});

app.use(notFoundError);

app.use(globalErrorHandler);

export default app;
