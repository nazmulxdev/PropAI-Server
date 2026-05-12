CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BUYER', 'SELLER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BANNED');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('FOR_SALE', 'FOR_RENT');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APARTMENT', 'HOUSE', 'VILLA', 'LAND', 'COMMERCIAL', 'OFFICE');

-- CreateEnum
CREATE TYPE "FurnishedStatus" AS ENUM ('FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED');

-- CreateEnum
CREATE TYPE "PriceType" AS ENUM ('TOTAL', 'PER_MONTH');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('PENDING', 'REPLIED', 'CLOSED');

-- CreateEnum
CREATE TYPE "BlogStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'BUYER',
    "userStatus" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "phone" TEXT,
    "bio" TEXT,
    "avater" TEXT,
    "preferredTypes" TEXT[],
    "priceRangeMin" DOUBLE PRECISION,
    "priceRangeMax" DOUBLE PRECISION,
    "agencyName" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "priceType" "PriceType" NOT NULL DEFAULT 'TOTAL',
    "status" "PropertyStatus" NOT NULL DEFAULT 'PENDING',
    "listingType" "ListingType" NOT NULL,
    "type" "PropertyType" NOT NULL,
    "city" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "areaSqft" DOUBLE PRECISION,
    "floorNumber" INTEGER,
    "totalFloors" INTEGER,
    "parkingSpaces" INTEGER,
    "yearBuilt" INTEGER,
    "furnished" "FurnishedStatus" NOT NULL DEFAULT 'UNFURNISHED',
    "amenities" TEXT[],
    "images" TEXT[],
    "tags" TEXT[],
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "sellerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savedProperty" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savedProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inquiry" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'PENDING',
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "senderId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "tags" TEXT[],
    "status" "BlogStatus" NOT NULL DEFAULT 'DRAFT',
    "views" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "browsingHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "browsingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_embeddings" (
    "id" TEXT NOT NULL,
    "chunkKey" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceLabel" TEXT,
    "content" TEXT NOT NULL,
    "metadata" JSONB DEFAULT '{}',
    "embedding" vector(2048) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_embeddings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE INDEX "property_sellerId_idx" ON "property"("sellerId");

-- CreateIndex
CREATE INDEX "property_city_idx" ON "property"("city");

-- CreateIndex
CREATE INDEX "property_type_idx" ON "property"("type");

-- CreateIndex
CREATE INDEX "savedProperty_userId_idx" ON "savedProperty"("userId");

-- CreateIndex
CREATE INDEX "savedProperty_propertyId_idx" ON "savedProperty"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "savedProperty_userId_propertyId_key" ON "savedProperty"("userId", "propertyId");

-- CreateIndex
CREATE INDEX "inquiry_buyerId_idx" ON "inquiry"("buyerId");

-- CreateIndex
CREATE INDEX "inquiry_sellerId_idx" ON "inquiry"("sellerId");

-- CreateIndex
CREATE INDEX "inquiry_propertyId_idx" ON "inquiry"("propertyId");

-- CreateIndex
CREATE INDEX "conversation_buyerId_idx" ON "conversation"("buyerId");

-- CreateIndex
CREATE INDEX "conversation_sellerId_idx" ON "conversation"("sellerId");

-- CreateIndex
CREATE INDEX "conversation_propertyId_idx" ON "conversation"("propertyId");

-- CreateIndex
CREATE INDEX "notification_userId_idx" ON "notification"("userId");

-- CreateIndex
CREATE INDEX "message_senderId_idx" ON "message"("senderId");

-- CreateIndex
CREATE INDEX "message_conversationId_idx" ON "message"("conversationId");

-- CreateIndex
CREATE INDEX "blog_authorId_idx" ON "blog"("authorId");

-- CreateIndex
CREATE INDEX "review_userId_idx" ON "review"("userId");

-- CreateIndex
CREATE INDEX "review_propertyId_idx" ON "review"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "review_userId_propertyId_key" ON "review"("userId", "propertyId");

-- CreateIndex
CREATE INDEX "browsingHistory_userId_idx" ON "browsingHistory"("userId");

-- CreateIndex
CREATE INDEX "browsingHistory_propertyId_idx" ON "browsingHistory"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "document_embeddings_chunkKey_key" ON "document_embeddings"("chunkKey");

-- CreateIndex
CREATE INDEX "document_embeddings_sourceType_idx" ON "document_embeddings"("sourceType");

-- CreateIndex
CREATE INDEX "document_embeddings_isDeleted_idx" ON "document_embeddings"("isDeleted");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savedProperty" ADD CONSTRAINT "savedProperty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savedProperty" ADD CONSTRAINT "savedProperty_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiry" ADD CONSTRAINT "inquiry_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog" ADD CONSTRAINT "blog_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "browsingHistory" ADD CONSTRAINT "browsingHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "browsingHistory" ADD CONSTRAINT "browsingHistory_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
