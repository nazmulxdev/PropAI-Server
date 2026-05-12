/* eslint-disable @typescript-eslint/no-explicit-any */

import { config } from "../../config/env";
import AppError from "../../shared/AppError";

export class EmbeddingService {
  private apikey: string;
  private apiurl: string = "https://openrouter.ai/api/v1";
  private embeddingModel: string;

  constructor() {
    this.apikey = config.OPEN_ROUTER_API_KEY;
    this.embeddingModel = config.OPEN_ROUTER_EMBEDDING_MODEL;
    if (!this.apikey) throw new AppError(500, "OpenRouter API key is required");
  }

  async generateEmbedding(content: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.apiurl}/embeddings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apikey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: content, model: this.embeddingModel }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AppError(422, `Embedding failed: ${errorText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (err: any) {
      console.error("Embedding error:", err);
      throw new AppError(500, err.message || "Failed to generate embedding");
    }
  }
}
