import "dotenv/config";

interface EnvConfig {
  DATABASE_URL: string;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  NODE_ENV?: string;
  PORT?: string;
}

const loadEnv = (): EnvConfig => {
  const requiredVariables = [
    "DATABASE_URL",
    "BETTER_AUTH_URL",
    "BETTER_AUTH_SECRET",
    "NODE_ENV",
    "PORT",
  ];
  requiredVariables.forEach((variable) => {
    if (!process.env[variable]) {
      throw new Error(`Missing environment variable: ${variable}`);
    }
  });

  return {
    DATABASE_URL: process.env.DATABASE_URL as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: process.env.PORT as string,
  };
};

export const config = loadEnv();
