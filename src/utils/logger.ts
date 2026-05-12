import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }), // capture stack traces
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
    new DailyRotateFile({
      filename: path.join(process.cwd(), "logs", "application-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: "info",
    }),
    new DailyRotateFile({
      filename: path.join(process.cwd(), "logs", "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      level: "error",
    }),
  ],
});
