import util from "util";
import Redis from "ioredis";
import hmacSHA512 from "crypto-js/hmac-sha512";
import Base64 from "crypto-js/enc-base64";
import { REDIS_URI_CONNECTION } from "../config/redis";

class CacheSingleton {
  private redis: Redis;

  private keys: (pattern: string) => Promise<string[]>;

  private static instance: CacheSingleton;

  private constructor(redisInstance: Redis) {
    this.redis = redisInstance;

    this.set = util.promisify(this.redis.set).bind(this.redis);
    this.get = util.promisify(this.redis.get).bind(this.redis);
    this.keys = util.promisify(this.redis.keys).bind(this.redis);
    this.del = util.promisify(this.redis.del).bind(this.redis);
  }

  public static getInstance(redisInstance: Redis): CacheSingleton {
    if (!CacheSingleton.instance) {
      CacheSingleton.instance = new CacheSingleton(redisInstance);
    }
    return CacheSingleton.instance;
  }

  private static encryptParams(params: any) {
    const str = JSON.stringify(params);
    const key = Base64.stringify(hmacSHA512(params, str));
    return key;
  }

  public async set(
    key: string,
    value: string,
    option?: string,
    optionValue?: string | number
  ): Promise<string> {
    const setPromisefy = util.promisify(this.redis.set).bind(this.redis);
    if (option !== undefined && optionValue !== undefined) {
      return setPromisefy(key, value, option, optionValue);
    }

    return setPromisefy(key, value);
  }

  public async get(key: string): Promise<string | null> {
    const getPromisefy = util.promisify(this.redis.get).bind(this.redis);
    return getPromisefy(key);
  }

  public async getKeys(pattern: string): Promise<string[]> {
    const getKeysPromisefy = util.promisify(this.redis.keys).bind(this.redis);
    return getKeysPromisefy(pattern);
  }

  public async del(key: string): Promise<number> {
    const delPromisefy = util.promisify(this.redis.del).bind(this.redis);
    return delPromisefy(key);
  }

  public async delFromPattern(pattern: string): Promise<void> {
    const all = await this.getKeys(pattern);
    await Promise.all(all.map(item => this.del(item)));
  }

  public async setFromParams(
    key: string,
    params: any,
    value: string,
    option?: string,
    optionValue?: string | number
  ): Promise<string> {
    const finalKey = `${key}:${CacheSingleton.encryptParams(params)}`;
    if (option !== undefined && optionValue !== undefined) {
      return this.set(finalKey, value, option, optionValue);
    }
    return this.set(finalKey, value);
  }

  public async getFromParams(key: string, params: any): Promise<string | null> {
    const finalKey = `${key}:${CacheSingleton.encryptParams(params)}`;
    return this.get(finalKey);
  }

  public async delFromParams(key: string, params: any): Promise<number> {
    const finalKey = `${key}:${CacheSingleton.encryptParams(params)}`;
    return this.del(finalKey);
  }

  public getRedisInstance(): Redis {
    return this.redis;
  }
}

const redisInstance = new Redis(REDIS_URI_CONNECTION);

export default CacheSingleton.getInstance(redisInstance);