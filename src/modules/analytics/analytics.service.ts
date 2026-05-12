import { prisma } from "../../lib/prisma.js";

const getSellerAnalytics = async (sellerId: string) => {
  const [
    totalProperties,
    totalInquiries,
    propertyViews,
    statusBreakdown,
    typeBreakdown,
  ] = await Promise.all([
    prisma.property.count({ where: { sellerId } }),
    prisma.inquiry.count({ where: { sellerId } }),
    prisma.property.aggregate({
      where: { sellerId },
      _sum: { viewCount: true },
    }),
    prisma.property.groupBy({
      by: ["status"],
      where: { sellerId },
      _count: true,
    }),
    prisma.property.groupBy({
      by: ["type"],
      where: { sellerId },
      _count: true,
    }),
  ]);

  return {
    totalProperties,
    totalInquiries,
    totalViews: propertyViews._sum.viewCount || 0,
    statusBreakdown: statusBreakdown.map((s) => ({
      status: s.status,
      count: s._count,
    })),
    typeBreakdown: typeBreakdown.map((t) => ({
      type: t.type,
      count: t._count,
    })),
  };
};

const getAdminAnalytics = async () => {
  const [
    totalUsers,
    totalProperties,
    totalInquiries,
    userRoleBreakdown,
    propertyStatusBreakdown,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.property.count(),
    prisma.inquiry.count(),
    prisma.user.groupBy({
      by: ["role"],
      _count: true,
    }),
    prisma.property.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  return {
    totalUsers,
    totalProperties,
    totalInquiries,
    roleBreakdown: userRoleBreakdown.map((r) => ({
      role: r.role,
      count: r._count,
    })),
    statusBreakdown: propertyStatusBreakdown.map((s) => ({
      status: s.status,
      count: s._count,
    })),
  };
};

export const analyticsService = {
  getSellerAnalytics,
  getAdminAnalytics,
};
