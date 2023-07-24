import { RedisClientType } from "redis";

export class Redis {
  private client?: RedisClientType<any, any, any>;

  constructor(client?: RedisClientType<any, any, any>) {
    this.client = client;
  }

  public get(id: string, timeout = 5000): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Redis client not responding"));
      }, timeout);

      if (!this.client?.isReady) {
        reject(new Error("Redis client not connected"));
      }
      this.client
        ?.get(id)
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(reject);
    });
  }

  public set(id: string, value: string, timeout = 5000): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Redis client not responding"));
      }, timeout);

      if (!this.client?.isReady) {
        reject(new Error("Redis client not connected"));
      }

      this.client
        ?.set(id, value)
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch(reject);
    });
  }
}
