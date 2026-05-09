import cors from "cors";
import cookieParser from "cookie-parser";
import qs from "qs";
import type { Application, Request, Response } from "express";
import express from "express";

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

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to the EcoSpark Hub.",
    success: true,
    docs: "/api/v1/docs",
    status: "Running",
  });
});

export default app;
