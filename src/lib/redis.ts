import { createClient, RedisClientType } from "redis";
import { config } from "../config/env";

class RedisService {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  public getRawClient() {
    return this.client;
  }
  public isConnectedCheck(): boolean {
    return this.isConnected;
  }

  async connect(): Promise<void> {
    try {
      const redisUrl = config.REDIS_URL;

      this.client = createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error("❌ Redis retry exhausted");
              return new Error("Retry attempts exhausted");
            }
            return Math.min(retries * 200, 2000);
          },
        },
      });

      this.client.on("error", (error) => {
        console.error("❌ Redis Error:", error.message);
        this.isConnected = false;
      });

      this.client.on("connect", () => console.log("🔌 Redis connecting..."));
      this.client.on("ready", () => {
        this.isConnected = true;
        console.log("✅ Redis ready");
      });
      this.client.on("reconnecting", () => {
        this.isConnected = false;
        console.log("🔄 Redis reconnecting...");
      });
      this.client.on("end", () => {
        this.isConnected = false;
        console.log("❌ Redis disconnected");
      });

      // ✅ Only change — await instead of fire-and-forget
      await this.client.connect();
    } catch (error) {
      this.isConnected = false;
      console.error("❌ Redis setup error:", error);
    }
  }

  // ✅ Safe client getter (non-blocking)
  private getClient(): RedisClientType | null {
    if (!this.client || !this.isConnected) {
      return null;
    }
    return this.client;
  }

  // 🔍 GET
  async get(key: string): Promise<string | null> {
    try {
      const client = this.getClient();
      if (!client) return null;

      return await client.get(key);
    } catch (error) {
      console.error("❌ Redis GET error:", error);
      return null;
    }
  }

  // 💾 SET
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      const client = this.getClient();
      if (!client) return;

      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);

      await client.set(key, stringValue, ttl ? { EX: ttl } : undefined);
    } catch (error) {
      console.error("❌ Redis SET error:", error);
    }
  }

  // ❌ DELETE
  async delete(key: string): Promise<void> {
    try {
      const client = this.getClient();
      if (!client) return;

      await client.del(key);
    } catch (error) {
      console.error("❌ Redis DELETE error:", error);
    }
  }

  // 🏓 HEALTH CHECK
  async isAvailable(): Promise<boolean> {
    try {
      const client = this.getClient();
      if (!client) return false;

      await client.ping();
      return true;
    } catch (error) {
      console.error("❌ Redis ping failed:", error);
      return false;
    }
  }

  // ⚡ CACHE WRAPPER (BEST PART)
  async getCachedOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = 60,
  ): Promise<T> {
    try {
      const client = this.getClient();

      // ✅ Try cache
      if (client) {
        const cached = await client.get(key);
        if (cached) {
          try {
            return JSON.parse(cached) as T;
          } catch {
            return cached as unknown as T;
          }
        }
      }

      // 🚀 Fetch fresh data
      const data = await fetcher();

      // 💾 Store in cache
      if (client && data !== undefined && data !== null) {
        await this.set(key, data, ttl);
      }

      return data;
    } catch (error) {
      console.error("❌ Cache wrapper error:", error);

      // fallback to direct fetch
      return await fetcher();
    }
  }

  // 🔌 DISCONNECT
  async disconnect(): Promise<void> {
    try {
      if (this.client && this.isConnected) {
        await this.client.quit();
        this.isConnected = false;
        console.log("🔌 Redis disconnected");
      }
    } catch (error) {
      console.error("❌ Redis disconnect error:", error);
    }
  }
}

// ✅ Singleton export
export const redisService = new RedisService();
