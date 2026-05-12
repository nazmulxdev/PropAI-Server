/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { config } from "../../config/env";
import AppError from "../../shared/AppError";

export class LLMService {
  private apikey: string;
  private apiurl: string = "https://openrouter.ai/api/v1";
  private model: string;

  constructor() {
    this.apikey = config.OPEN_ROUTER_API_KEY || "";
    this.model = config.OPEN_ROUTER_LLM_MODEL as string;
    if (!this.apikey) throw new AppError(500, "OpenRouter API key is required");
  }

  async generateResponse(prompt: string, context: string[]): Promise<string> {
    try {
      let fullPrompt =
        context.length > 0
          ? `Context information:\n${context.join("\n")}\n\nQuestion: ${prompt}\n\nAnswer based on the context. If not found, say "I don't have that information." Be concise and helpful.`
          : prompt;

      const response = await fetch(`${this.apiurl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apikey}`,
          "Content-Type": "application/json",
          "X-Title": "PropAI",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content:
                "You are PropAI's real estate assistant. Answer only based on the provided context (properties, sellers, blogs, FAQs). If no relevant information exists, say so. Never make up listings or prices. Be friendly and helpful.",
            },
            { role: "user", content: fullPrompt },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new AppError(response.status, `LLM error: ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error: any) {
      console.error("LLM error:", error);
      throw new AppError(500, "Failed to generate response");
    }
  }
}
