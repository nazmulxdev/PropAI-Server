// model Property {
//   id            String    @id @default(cuid())
//   title         String
//   slug          String    @unique
//   description   String
//   price         Float
//   priceType     PriceType @default(TOTAL)
//   status        PropertyStatus @default(PENDING)
//   listingType   ListingType
//   type          PropertyType
//   city          String
//   area          String
//   address       String
//   latitude      Float?
//   longitude     Float?
//   bedrooms      Int?
//   bathrooms     Int?
//   areaSqft      Float?
//   floorNumber   Int?
//   totalFloors   Int?
//   parkingSpaces Int?
//   yearBuilt     Int?
//   furnished     FurnishedStatus @default(UNFURNISHED)
//   amenities     String[]
//   images        String[]
//   tags          String[]
//   viewCount     Int    @default(0)
//   avgRating     Float  @default(0)
//   reviewCount   Int    @default(0)

import {
  FurnishedStatus,
  ListingType,
  PriceType,
  PropertyType,
} from "../../../generated/prisma/enums";

//   sellerId      String
//   seller        User   @relation(fields: [sellerId], references: [id])

//   createdAt     DateTime @default(now())
//   updatedAt     DateTime @updatedAt

//   inquiries      Inquiry[]
//   reviews        Review[]
//   conversations  Conversation[]
// }

export interface ICreateProperty {
  title: string;
  description: string;
  price: number;
  priceType: PriceType;
  listingType: ListingType;
  type: PropertyType;
  city: string;
  area: string;
  address: string;
  latitude: number;
  longitude: number;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  floorNumber: number;
  totalFloors: number;
  parkingSpaces: number;
  yearBuilt: number;
  furnished: FurnishedStatus;
  amenities: string[];
  images: string[];
  tags: string[];
}
