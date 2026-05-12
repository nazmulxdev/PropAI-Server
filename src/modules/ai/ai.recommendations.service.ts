/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../../lib/prisma";
import { redisService } from "../../lib/redis";
import AppError from "../../shared/AppError";
import { LLMService } from "../rag/llm.sesrvice";

export class RecommendationService {
  private llm: LLMService;

  constructor() {
    this.llm = new LLMService();
  }

  async getRecommendations(userId: string) {
    const cacheKey = `ai:recommendations:${userId}`;
    const cached = await redisService.get(cacheKey);
    if (cached) return JSON.parse(cached);

    // 1. User preferences (only what exists in your schema)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferredTypes: true,
        priceRangeMin: true,
        priceRangeMax: true,
      },
    });

    // 2. Browsing history (last 15)
    const browsingHistory = await prisma.browsingHistory.findMany({
      where: { userId },
      orderBy: { viewedAt: "desc" },
      take: 15,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            type: true,
            city: true,
            price: true,
          },
        },
      },
    });

    // 3. Saved properties
    const savedProperties = await prisma.savedProperty.findMany({
      where: { userId },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            type: true,
            city: true,
            price: true,
          },
        },
      },
    });

    // 4. Candidate properties (newest 60 active)
    const candidates = await prisma.property.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        title: true,
        type: true,
        city: true,
        price: true,
        bedrooms: true,
        amenities: true,
        listingType: true,
      },
      take: 60,
      orderBy: { createdAt: "desc" },
    });

    // 5. Build prompt (no preferredCities)
    const userProfile = `Preferences: types=${user?.preferredTypes?.join(", ") || "any"}, budget=${user?.priceRangeMin ?? 0}-${user?.priceRangeMax ?? "any"} BDT`;

    const viewed =
      browsingHistory
        .map(
          (h) =>
            `${h.property.title} (${h.property.type}, ${h.property.city}, ${h.property.price} BDT)`,
        )
        .join("; ") || "None";

    const saved =
      savedProperties.map((s) => s.property.title).join(", ") || "None";

    const candidateList = candidates
      .map(
        (p) =>
          `ID: ${p.id} | ${p.title} | ${p.type} | ${p.city} | Price: ${p.price} | Bedrooms: ${p.bedrooms} | Amenities: ${p.amenities.join(", ")} | Listing: ${p.listingType}`,
      )
      .join("\n");

    const prompt = `
User Profile: ${userProfile}
Recently viewed: ${viewed}
Saved: ${saved}

Available properties to recommend from:
${candidateList}

Based on user preferences and history, recommend exactly 8 properties (by ID) that the user might like.
For each, provide a short reason.
Return ONLY valid JSON, no markdown:
{ "recommendations": [ { "id": "property_id", "reason": "why this matches" } ] }
`;

    // 6. Call LLM
    const llmResponse = await this.callLLMForJSON(prompt);
    if (
      !llmResponse?.recommendations ||
      !Array.isArray(llmResponse.recommendations)
    ) {
      throw new AppError(500, "Failed to generate recommendations");
    }

    // 7. Fetch full property data
    const ids = llmResponse.recommendations.map((r: any) => r.id);
    const properties = await prisma.property.findMany({
      where: { id: { in: ids } },
      include: {
        seller: { select: { id: true, name: true, image: true } },
      },
    });

    const recommendations = llmResponse.recommendations.map((rec: any) => {
      const property = properties.find((p) => p.id === rec.id);
      return { property, reason: rec.reason };
    });

    const result = { recommendations };
    await redisService.set(cacheKey, JSON.stringify(result), 1800);
    return result;
  }

  private async callLLMForJSON(prompt: string): Promise<any> {
    // Use the existing LLMService, but we need to parse JSON
    const response = await this.llm.generateResponse(prompt, []); // empty context
    // Strip any markdown code fences
    const cleaned = response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    try {
      return JSON.parse(cleaned);
    } catch (err) {
      console.error("Failed to parse LLM response:", err, cleaned);
      throw new AppError(500, "Invalid response from AI model");
    }
  }

  // Helper to invalidate cache
  async invalidateCache(userId: string) {
    const cacheKey = `ai:recommendations:${userId}`;
    await redisService.delete(cacheKey);
  }
}

export const recommendationService = new RecommendationService();
