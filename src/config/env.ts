import "dotenv/config";

interface EnvConfig {
  DATABASE_URL: string;
  REDIS_URL: string;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  NODE_ENV?: string;
  PORT?: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  CLOUDINARY_CLOUD_NAME: string;
  OPEN_ROUTER_API_KEY: string;
  OPEN_ROUTER_EMBEDDING_MODEL: string;
  OPEN_ROUTER_LLM_MODEL: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  ADMIN_NAME: string;

  DEMO_SELLER_EMAIL: string;
  DEMO_SELLER_PASSWORD: string;
  DEMO_SELLER_NAME: string;

  DEMO_BUYER_EMAIL: string;
  DEMO_BUYER_PASSWORD: string;
  DEMO_BUYER_NAME: string;
}

const loadEnv = (): EnvConfig => {
  const requiredVariables = [
    "DATABASE_URL",
    "REDIS_URL",
    "BETTER_AUTH_URL",
    "BETTER_AUTH_SECRET",
    "NODE_ENV",
    "PORT",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "OPEN_ROUTER_API_KEY",
    "OPEN_ROUTER_EMBEDDING_MODEL",
    "OPEN_ROUTER_LLM_MODEL",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
    "ADMIN_NAME",
    "DEMO_SELLER_EMAIL",
    "DEMO_SELLER_PASSWORD",
    "DEMO_SELLER_NAME",
    "DEMO_BUYER_EMAIL",
    "DEMO_BUYER_PASSWORD",
    "DEMO_BUYER_NAME",
  ];
  requiredVariables.forEach((variable) => {
    if (!process.env[variable]) {
      throw new Error(`Missing environment variable: ${variable}`);
    }
  });

  return {
    DATABASE_URL: process.env.DATABASE_URL as string,
    REDIS_URL: process.env.REDIS_URL as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: process.env.PORT as string,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
    OPEN_ROUTER_API_KEY: process.env.OPEN_ROUTER_API_KEY as string,
    OPEN_ROUTER_EMBEDDING_MODEL: process.env
      .OPEN_ROUTER_EMBEDDING_MODEL as string,
    OPEN_ROUTER_LLM_MODEL: process.env.OPEN_ROUTER_LLM_MODEL as string,

    ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
    ADMIN_NAME: process.env.ADMIN_NAME as string,
    DEMO_SELLER_EMAIL: process.env.DEMO_SELLER_EMAIL as string,
    DEMO_SELLER_PASSWORD: process.env.DEMO_SELLER_PASSWORD as string,
    DEMO_SELLER_NAME: process.env.DEMO_SELLER_NAME as string,
    DEMO_BUYER_EMAIL: process.env.DEMO_BUYER_EMAIL as string,
    DEMO_BUYER_PASSWORD: process.env.DEMO_BUYER_PASSWORD as string,
    DEMO_BUYER_NAME: process.env.DEMO_BUYER_NAME as string,
  };
};

export const config = loadEnv();
