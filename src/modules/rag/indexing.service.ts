/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../shared/AppError";

import { EmbeddingService } from "./embedding.service";

const toVectorLiteral = (vector: number[]) => `[${vector.join(",")}]`;

export class IndexingService {
  private embeddingService: EmbeddingService;
  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  private async indexDocument(
    chunkKey: string,
    sourceType: string,
    sourceId: string,
    content: string,
    sourceLabel?: string,
    metadata?: Record<string, unknown>,
  ) {
    try {
      const embedding = await this.embeddingService.generateEmbedding(content);
      const vectorLiteral = toVectorLiteral(embedding);

      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO "document_embeddings"
        ("id", "chunkKey", "sourceType", "sourceId", "sourceLabel", "content", "metadata", "embedding", "updatedAt")
        VALUES (
          ${Prisma.raw("gen_random_uuid()::TEXT")}, ${chunkKey}, ${sourceType}, ${sourceId},
          ${sourceLabel || null}, ${content}, ${JSON.stringify(metadata || {})}::jsonb,
          CAST(${vectorLiteral} AS vector), NOW()
        )
        ON CONFLICT ("chunkKey") DO UPDATE SET
          "content" = EXCLUDED."content", "metadata" = EXCLUDED."metadata",
          "embedding" = EXCLUDED."embedding", "updatedAt" = NOW(), "isDeleted" = false
      `);
    } catch (error: any) {
      console.error(`Index error: ${error.message}`);
      throw new AppError(500, error.message);
    }
  }

  async indexPropertiesData() {
    console.log("🏠 Indexing properties...");
    const properties = await prisma.property.findMany({
      where: { status: "ACTIVE" },
      include: { seller: true },
    });

    let count = 0;
    for (const prop of properties) {
      const content = [
        `Property: ${prop.title}`,
        `Type: ${prop.type} | Listing: ${prop.listingType}`,
        `Location: ${prop.city}, ${prop.area}`,
        `Price: ${prop.price} BDT ${prop.priceType === "PER_MONTH" ? "/month" : ""}`,
        `Bedrooms: ${prop.bedrooms || "N/A"}, Bathrooms: ${prop.bathrooms || "N/A"}`,
        `Size: ${prop.areaSqft || "N/A"} sqft`,
        `Amenities: ${prop.amenities.join(", ")}`,
        `Description: ${prop.description.substring(0, 300)}`,
        `Seller: ${prop.seller.name} (${prop.seller.agencyName || "Individual"})`,
      ].join("\n");

      await this.indexDocument(
        `property-${prop.id}`,
        "PROPERTY",
        prop.id,
        content,
        prop.title,
        {
          propertyId: prop.id,
          type: prop.type,
          city: prop.city,
          price: prop.price,
          listingType: prop.listingType,
          sellerName: prop.seller.name,
        },
      );
      count++;
    }
    console.log(`✅ Indexed ${count} properties`);
    return { indexedCount: count };
  }

  async indexSellersData() {
    console.log("👤 Indexing sellers...");
    const sellers = await prisma.user.findMany({
      where: { role: "SELLER", userStatus: "ACTIVE" },
    });

    let count = 0;
    for (const seller of sellers) {
      const propertyCount = await prisma.property.count({
        where: { sellerId: seller.id, status: "ACTIVE" },
      });

      const content = [
        `Agent: ${seller.name}`,
        `Agency: ${seller.agencyName || "Independent"}`,
        `Contact: ${seller.email}`,
        `Active listings: ${propertyCount}`,
      ].join("\n");

      await this.indexDocument(
        `seller-${seller.id}`,
        "SELLER",
        seller.id,
        content,
        seller.name,
        { sellerId: seller.id, agency: seller.agencyName },
      );
      count++;
    }
    console.log(`✅ Indexed ${count} sellers`);
    return { indexedCount: count };
  }

  async indexBlogsData() {
    console.log("📝 Indexing blogs...");
    const blogs = await prisma.blog.findMany({
      where: { status: "PUBLISHED" },
    });

    let count = 0;
    for (const blog of blogs) {
      const content = `Title: ${blog.title}\nTags: ${blog.tags.join(", ")}\nContent: ${blog.content.substring(0, 500)}`;

      await this.indexDocument(
        `blog-${blog.id}`,
        "BLOG",
        blog.id,
        content,
        blog.title,
        { blogId: blog.id, tags: blog.tags },
      );
      count++;
    }
    console.log(`✅ Indexed ${count} blogs`);
    return { indexedCount: count };
  }

  async indexFAQsData() {
    console.log("❓ Indexing FAQs...");
    const faqs = [
      {
        id: "faq-1",
        q: "How do I contact a property seller?",
        a: "Log in, find a property, and click 'Contact Seller' to send an inquiry directly.",
      },
      {
        id: "faq-2",
        q: "How do I list my property?",
        a: "Register as a seller, go to Dashboard, and click 'Add Property'. Fill in details and submit for review.",
      },
      {
        id: "faq-3",
        q: "What are the fees for listing a property?",
        a: "PropAI currently offers free listings for a limited time. Premium features may be introduced later.",
      },
      {
        id: "faq-4",
        q: "How do I search for properties?",
        a: "Use the search bar on the homepage. You can filter by city, type, price, bedrooms, and more.",
      },
      {
        id: "faq-5",
        q: "Is there a mobile app?",
        a: "Our website is fully mobile-responsive. A dedicated app is in development.",
      },
      {
        id: "faq-6",
        q: "How do I save a property for later?",
        a: "Click the heart icon on any property card to save it. You can view saved properties in your dashboard.",
      },
      {
        id: "faq-7",
        q: "What payment methods are accepted?",
        a: "PropAI does not handle payments directly. Deals are between buyers and sellers.",
      },
    ];

    let count = 0;
    for (const faq of faqs) {
      const content = `Q: ${faq.q}\nA: ${faq.a}`;
      await this.indexDocument(`faq-${faq.id}`, "FAQ", faq.id, content, faq.q, {
        question: faq.q,
      });
      count++;
    }
    console.log(`✅ Indexed ${count} FAQs`);
    return { indexedCount: count };
  }

  async indexAllData() {
    const properties = await this.indexPropertiesData();
    const sellers = await this.indexSellersData();
    const blogs = await this.indexBlogsData();
    const faqs = await this.indexFAQsData();

    return {
      properties: properties.indexedCount,
      sellers: sellers.indexedCount,
      blogs: blogs.indexedCount,
      faqs: faqs.indexedCount,
      total:
        properties.indexedCount +
        sellers.indexedCount +
        blogs.indexedCount +
        faqs.indexedCount,
    };
  }
}
