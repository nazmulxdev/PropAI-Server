/* eslint-disable @typescript-eslint/no-unused-vars */

import AppError from "../../shared/AppError";
import { LLMService } from "../rag/llm.sesrvice";

export class AIAnalyzerService {
  private llm: LLMService;

  constructor() {
    this.llm = new LLMService();
  }

  async analyzeSellerData(data: {
    viewsOverTime: { date: string; views: number }[];
    inquiriesPerListing: { title: string; count: number }[];
    typeDistribution: { type: string; count: number }[];
  }) {
    const prompt = `
You are a real estate analytics expert. A seller has provided the following data:
- Daily views over time: ${JSON.stringify(data.viewsOverTime)}
- Inquiries per listing: ${JSON.stringify(data.inquiriesPerListing)}
- Property type distribution: ${JSON.stringify(data.typeDistribution)}

Analyze the data and provide exactly 4 insights.
Each insight must have a title (short headline), an insight (1-2 sentence explanation), and a type ("positive", "warning", or "neutral").
Return ONLY JSON in this exact format:
{
  "insights": [
    { "title": "...", "insight": "...", "type": "positive" },
    ...
  ]
}
`;

    const response = await this.llm.generateResponse(prompt, []);
    return this.parseInsights(response);
  }

  async analyzeAdminData(data: {
    usersOverTime: { date: string; count: number }[];
    listingsPerCity: { city: string; count: number }[];
    typeDistribution: { type: string; count: number }[];
    inquiriesPerDay: { date: string; count: number }[];
  }) {
    const prompt = `
You are a PropAI platform administrator. Here is the platform-wide data:
- New users over time: ${JSON.stringify(data.usersOverTime)}
- Listings per city: ${JSON.stringify(data.listingsPerCity)}
- Property type distribution: ${JSON.stringify(data.typeDistribution)}
- Inquiries per day: ${JSON.stringify(data.inquiriesPerDay)}

Based on this data, provide exactly 4 insights.
Each insight must have a title, an insight explanation, and a type ("positive", "warning", or "neutral").
Return ONLY JSON in this exact format:
{
  "insights": [
    { "title": "...", "insight": "...", "type": "positive" },
    ...
  ]
}
`;

    const response = await this.llm.generateResponse(prompt, []);
    return this.parseInsights(response);
  }

  private parseInsights(llmResponse: string) {
    const cleaned = llmResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    try {
      const parsed = JSON.parse(cleaned);
      if (!parsed.insights || !Array.isArray(parsed.insights)) {
        throw new Error("Invalid format");
      }
      return parsed;
    } catch (err) {
      console.error("Failed to parse AI insights:", cleaned);
      throw new AppError(500, "Invalid response from AI analyzer");
    }
  }
}

export const aiAnalyzerService = new AIAnalyzerService();
