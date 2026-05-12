import { createServer, Server } from "http";
import app from "./app.js";
import { logger } from "./utils/logger.js";
import { redisService } from "./lib/redis.js";
import { prisma } from "./lib/prisma.js";
import { seedAdmin } from "./utils/seed.js";
import { initSocket } from "./lib/socket.js";

const port = 5000;
let server: Server;

const bootStrap = async () => {
  try {
    await prisma.$connect();
    await redisService.connect();
    await seedAdmin();

    server = createServer(app);
    initSocket(server);

    server.listen(port, () => {
      logger.info(`This server is running on the port: ${port}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1); // ← if bootstrap itself fails, exit with error
  }
};

const gracefulShutdown = (signal: string) => {
  logger.info(`⚠️ ${signal} received. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      await redisService.disconnect();
      logger.info("💤 Server closed successfully.");
      process.exit(0);
    });
  } else {
    process.exit(0); // ✅ no server yet = still a clean exit
  }
};

// Signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Uncaught Exception
process.on("uncaughtException", (error: unknown) => {
  logger.error("❌ Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

// Unhandled Rejection
process.on("unhandledRejection", (reason: unknown) => {
  logger.error("❌ Unhandled Rejection:", reason);
  gracefulShutdown("unhandledRejection");
});

bootStrap();
