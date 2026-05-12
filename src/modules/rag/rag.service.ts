/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../shared/AppError";

import { EmbeddingService } from "./embedding.service";
import { IndexingService } from "./indexing.service";
import { LLMService } from "./llm.sesrvice";

const toVectorLiteral = (vector: number[]) => `[${vector.join(",")}]`;

export class RagService {
  private embeddingService: EmbeddingService;
  private llmService: LLMService;
  private indexingService: IndexingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
    this.llmService = new LLMService();
    this.indexingService = new IndexingService();
  }

  async ingestAllData() {
    return this.indexingService.indexAllData();
  }

  async retrieveRelevantDocuments(
    query: string,
    limit: number = 5,
    sourceType?: string,
  ) {
    try {
      const embedding = await this.embeddingService.generateEmbedding(query);
      const vectorLiteral = toVectorLiteral(embedding);

      const result = await prisma.$queryRaw(Prisma.sql`
        SELECT "id", "chunkKey", "sourceType", "sourceId", "sourceLabel", "content", "metadata", "createdAt",
        1 - (embedding <=> CAST(${vectorLiteral} AS vector)) AS similarity
        FROM "document_embeddings"
        WHERE "isDeleted" = false
        ${sourceType ? Prisma.sql` AND "sourceType" = ${sourceType}` : Prisma.empty}
        ORDER BY embedding <=> CAST(${vectorLiteral} AS vector)
        LIMIT ${limit}
      `);
      return result;
    } catch (error: any) {
      console.error(`Retrieve error: ${error.message}`);
      throw new AppError(500, error.message);
    }
  }

  async generateAnswer(query: string, limit: number = 5, sourceType?: string) {
    try {
      const relevantDocs = await this.retrieveRelevantDocuments(
        query,
        limit,
        sourceType,
      );
      const context = (relevantDocs as any)
        .filter((d: any) => d.content)
        .map((d: any) => d.content);
      const answer = await this.llmService.generateResponse(query, context);

      return {
        answer,
        sources: (relevantDocs as any).map((doc: any) => ({
          id: doc.id,
          sourceType: doc.sourceType,
          sourceLabel: doc.sourceLabel,
          similarity: doc.similarity,
        })),
        contextUsed: context.length > 0,
      };
    } catch (error: any) {
      console.error(`Generate error: ${error.message}`);
      throw new AppError(500, error.message);
    }
  }
}
