import { Router } from "express";
import { ingestData, queryRag } from "./rag.controller";
import { Role } from "../../../generated/prisma/enums";
import authMiddleware from "../../middlewares/AuthMiddleware";
import { ragQueryLimiter } from "../../shared/apiRate";

const router = Router();

// Admin/Superuser only for ingestion (secure it)
router.post(
  "/ingest",
  authMiddleware(Role.ADMIN),
  /* optionally adminOnly, */ ingestData,
);

// Public or auth-optional for query, but rate limited
router.post("/query", ragQueryLimiter, queryRag);

export const ragRoutes = router;
