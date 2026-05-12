/* eslint-disable @typescript-eslint/no-explicit-any */
import { callAI } from "../../lib/ai.js";
import { prisma } from "../../lib/prisma.js";
import { redisService } from "../../lib/redis.js";

const generatePropertyDescription = async (propertyData: any) => {
  const prompt = `
    Generate a compelling real estate description for the following property:
    Title: ${propertyData.title}
    Type: ${propertyData.type}
    Price: ${propertyData.price}
    Location: ${propertyData.area}, ${propertyData.city}
    Bedrooms: ${propertyData.bedrooms}
    Bathrooms: ${propertyData.bathrooms}
    Area: ${propertyData.areaSqft} sqft
    Amenities: ${propertyData.amenities?.join(", ")}
    
    Format the output as a professional description suitable for a listing.
    Return JSON only in the following format:
    {
      "description": "..."
    }
  `;

  try {
    const result = await callAI(
      [
        {
          role: "system",
          content: "You are a professional real estate copywriter.",
        },
        { role: "user", content: prompt },
      ],
      true,
    );
    return JSON.parse(result);
  } catch (error) {
    console.error("AI Generation failed:", error);
    return { description: `${propertyData.title} is a ${propertyData.type} located in ${propertyData.city}.` };
  }
};

const getAIRecommendations = async (userId: string) => {
  const cacheKey = `recommendations:${userId}`;

  return await redisService.getCachedOrFetch(cacheKey, async () => {
    // Fetch user history
    const history = await prisma.inquiry.findMany({
      where: { buyerId: userId },
      take: 5,
      include: { property: true },
      orderBy: { createdAt: "desc" },
    });

    if (history.length === 0) {
      // Fallback: Suggest featured/recent active properties
      return await prisma.property.findMany({
        where: { status: "ACTIVE" },
        take: 6,
        orderBy: { viewCount: "desc" },
      });
    }

    const userProfile = history.map((h) => ({
      type: h.property.type,
      city: h.property.city,
      price: h.property.price,
    }));

    const prompt = `
      Based on the following user inquiry history:
      ${JSON.stringify(userProfile)}
      
      Suggest 3 property types and price ranges the user might be interested in.
      Return JSON only: { "suggestions": [{ "type": "...", "maxPrice": ..., "city": "..." }] }
    `;

    try {
      const aiSuggestion = await callAI(
        [
          {
            role: "system",
            content: "You are a real estate recommendation engine.",
          },
          { role: "user", content: prompt },
        ],
        true,
      );

      const parsed = JSON.parse(aiSuggestion);

      // Fetch real properties matching suggestions
      return await prisma.property.findMany({
        where: {
          OR: parsed.suggestions.map((s: any) => ({
            type: s.type,
            price: { lte: s.maxPrice * 1.5 }, // Increased buffer for better results
            city: s.city,
          })),
          status: "ACTIVE",
        },
        take: 6,
      });
    } catch (error) {
      console.error("AI Recommendation failed, falling back to trending:", error);
      return await prisma.property.findMany({
        where: { status: "ACTIVE" },
        take: 6,
        orderBy: { viewCount: "desc" },
      });
    }
  });
};

const chatWithAssistant = async (userMessage: string) => {
  try {
    // 1. Extract Intent
    const intentPrompt = `
      Extract property search parameters from this message: "${userMessage}"
      Return JSON: { "city": "...", "maxPrice": ..., "type": "..." }
    `;

    const intentResult = await callAI(
      [
        { role: "system", content: "Extract search parameters from user input." },
        { role: "user", content: intentPrompt },
      ],
      true,
    );

    const intent = JSON.parse(intentResult);

    // 2. Query DB
    const matchingProperties = await prisma.property.findMany({
      where: {
        city:
          intent.city && intent.city !== "..."
            ? { contains: intent.city, mode: "insensitive" }
            : undefined,
        price: intent.maxPrice ? { lte: intent.maxPrice } : undefined,
        type: intent.type && intent.type !== "..." ? intent.type : undefined,
        status: "ACTIVE",
      },
      take: 3,
      select: { title: true, price: true, city: true, area: true },
    });

    // 3. Final Answer
    const finalPrompt = `
      The user asked: "${userMessage}"
      Here are the matching properties from our database: ${JSON.stringify(matchingProperties)}
      
      Provide a helpful, concise answer. If no properties found, suggest they refine their search.
      STRICT: Do not invent properties. Only use the ones provided.
    `;

    return await callAI([
      {
        role: "system",
        content: "You are PropAI Assistant. Help users find properties.",
      },
      { role: "user", content: finalPrompt },
    ]);
  } catch (error) {
    console.error("Chat Assistant error:", error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
  }
};

export const aiService = {
  generatePropertyDescription,
  getAIRecommendations,
  chatWithAssistant,
};
