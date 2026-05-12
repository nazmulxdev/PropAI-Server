/* eslint-disable @typescript-eslint/no-explicit-any */

import AppError from "../../shared/AppError";
import { LLMService } from "../rag/llm.sesrvice";

export class AIGenerateService {
  private llm: LLMService;

  constructor() {
    this.llm = new LLMService();
  }

  async generatePropertyDescription(data: {
    type: string;
    city: string;
    area: string;
    price: number;
    priceType: string;
    bedrooms: number;
    bathrooms: number;
    areaSqft: number;
    amenities: string[];
    listingType: string;
  }) {
    const prompt = `
Generate a professional property listing description for a ${data.type} in ${data.city}, ${data.area}.
Price: ${data.price} BDT (${data.priceType})
${data.bedrooms} bedrooms, ${data.bathrooms} bathrooms, ${data.areaSqft} sqft
Amenities: ${data.amenities.join(", ")}
Listing type: ${data.listingType}

Return ONLY valid JSON with these keys:
- description: 200-300 word professional description
- highlights: array of 5 key features (bullet points)
- metaDescription: 150 char SEO-friendly summary
`;
    return this.callAndParse(prompt);
  }

  async generateBlogPost(title: string, keywords?: string[]) {
    const kw = keywords?.join(", ") || "";
    const prompt = `
Write a blog post for a real estate website titled: "${title}".
Keywords: ${kw}

Return ONLY valid JSON with:
- introduction: 100 words
- sections: array of 3-4 objects, each with "heading" and "content" (150 words each)
- conclusion: 80 words
- tags: array of 5 SEO tags
`;
    return this.callAndParse(prompt);
  }

  async generatePropertyTags(title: string, description: string) {
    const prompt = `
Suggest 6 SEO-friendly tags for this property listing:
Title: ${title}
Description: ${description}

Return ONLY JSON: { "tags": ["tag1", "tag2", ...] }
`;
    return this.callAndParse(prompt);
  }

  private async callAndParse(prompt: string): Promise<any> {
    const response = await this.llm.generateResponse(prompt, []);
    const cleaned = response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    try {
      return JSON.parse(cleaned);
    } catch (err) {
      console.error("Failed to parse AI response:", err, cleaned);
      throw new AppError(500, "Invalid response from AI model");
    }
  }
}

export const aiGenerateService = new AIGenerateService();
