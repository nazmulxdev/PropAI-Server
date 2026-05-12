import { prisma } from "../../lib/prisma.js";
import { Role, PropertyStatus, PropertyType } from "../../../generated/prisma/enums.js";

interface BuyerStats {
  role: "BUYER";
  totalInquiries: number;
  totalReviews: number;
  interestedCities: { city: string; count: number }[];
}

interface SellerStats {
  role: "SELLER";
  totalProperties: number;
  totalInquiriesReceived: number;
  averagePropertyRating: number;
  totalViews: number;
  statusBreakdown: { status: PropertyStatus; count: number }[];
}

interface AdminStats {
  role: "ADMIN";
  totalUsers: number;
  totalProperties: number;
  totalInquiries: number;
  userDistribution: { role: Role; count: number }[];
  propertyDistribution: { type: PropertyType; count: number }[];
}

const getBuyerStats = async (userId: string): Promise<BuyerStats> => {
  const [inquiryCount, reviewCount] = await Promise.all([
    prisma.inquiry.count({ where: { buyerId: userId } }),
    prisma.review.count({ where: { userId } }),
  ]);

  // Fetch cities for favorite properties to aggregate
  const inquiries = await prisma.inquiry.findMany({
    where: { buyerId: userId },
    select: {
      property: { select: { city: true } },
    },
  });

  const cityCounts: Record<string, number> = {};
  inquiries.forEach((inq) => {
    const city = inq.property.city;
    cityCounts[city] = (cityCounts[city] || 0) + 1;
  });

  return {
    role: Role.BUYER,
    totalInquiries: inquiryCount,
    totalReviews: reviewCount,
    interestedCities: Object.entries(cityCounts).map(([city, count]) => ({
      city,
      count,
    })),
  };
};

const getSellerStats = async (userId: string): Promise<SellerStats> => {
  const [propertyCount, inquiryCount, aggregateData, statusBreakdown] =
    await Promise.all([
      prisma.property.count({ where: { sellerId: userId } }),
      prisma.inquiry.count({ where: { sellerId: userId } }),
      prisma.property.aggregate({
        where: { sellerId: userId },
        _avg: { avgRating: true },
        _sum: { viewCount: true },
      }),
      prisma.property.groupBy({
        by: ["status"],
        where: { sellerId: userId },
        _count: true,
      }),
    ]);

  return {
    role: Role.SELLER,
    totalProperties: propertyCount,
    totalInquiriesReceived: inquiryCount,
    averagePropertyRating: aggregateData._avg.avgRating || 0,
    totalViews: aggregateData._sum.viewCount || 0,
    statusBreakdown: statusBreakdown.map((s) => ({
      status: s.status as PropertyStatus,
      count: s._count,
    })),
  };
};

const getAdminStats = async (): Promise<AdminStats> => {
  const [
    userCount,
    propertyCount,
    inquiryCount,
    roleBreakdown,
    propertyTypeBreakdown,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.property.count(),
    prisma.inquiry.count(),
    prisma.user.groupBy({
      by: ["role"],
      _count: true,
    }),
    prisma.property.groupBy({
      by: ["type"],
      _count: true,
    }),
  ]);

  return {
    role: Role.ADMIN,
    totalUsers: userCount,
    totalProperties: propertyCount,
    totalInquiries: inquiryCount,
    userDistribution: roleBreakdown.map((r) => ({
      role: r.role as Role,
      count: r._count,
    })),
    propertyDistribution: propertyTypeBreakdown.map((t) => ({
      type: t.type as PropertyType,
      count: t._count,
    })),
  };
};

const getUserStats = async (userId: string, role: Role) => {
  switch (role) {
    case Role.ADMIN:
      return await getAdminStats();
    case Role.SELLER:
      return await getSellerStats(userId);
    case Role.BUYER:
      return await getBuyerStats(userId);
    default:
      throw new Error("Invalid role for stats");
  }
};

export const statsService = {
  getUserStats,
};
