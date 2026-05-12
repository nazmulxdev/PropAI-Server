import { Router } from "express";
import { propertyRoutes } from "../modules/properties/property.routes.js";
import { reviewRoutes } from "../modules/reviews/review.routes.js";
import { inquiryRoutes } from "../modules/inquiries/inquiry.routes.js";
import { notificationRoutes } from "../modules/notifications/notification.routes.js";
import { analyticsRoutes } from "../modules/analytics/analytics.routes.js";
import { aiRoutes } from "../modules/ai/ai.routes.js";
import { statsRoutes } from "../modules/stats/stats.routes.js";
import { ragRoutes } from "../modules/rag/rag.routes.js";
import { blogRoutes } from "../modules/blog/blog.routes.js";
import { userRoutes } from "../modules/user/user.routes.js";
import { messageRoutes } from "../modules/messages/messages.routes.js";

const router = Router();

const moduleRoutes = [
  {
    path: "/properties",
    route: propertyRoutes,
  },
  {
    path: "/reviews",
    route: reviewRoutes,
  },
  {
    path: "/inquiries",
    route: inquiryRoutes,
  },
  {
    path: "/notifications",
    route: notificationRoutes,
  },
  {
    path: "/analytics",
    route: analyticsRoutes,
  },
  {
    path: "/ai",
    route: aiRoutes,
  },
  {
    path: "/stats",
    route: statsRoutes,
  },
  {
    path: "/rag",
    route: ragRoutes,
  },
  {
    path: "/blogs",
    route: blogRoutes,
  },
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/messages",
    route: messageRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export const indexRoutes = router;
