import { Router } from "express";
import { ingestData, queryRag } from "./rag.controller";
import { Role } from "../../../generated/prisma/enums";
import authMiddleware from "../../middlewares/AuthMiddleware";
import { ragQueryLimiter } from "../../shared/apiRate";

const router = Router();

router.post("/ingest", authMiddleware(Role.ADMIN), ingestData);

router.post("/query", ragQueryLimiter, queryRag);

export const ragRoutes = router;
