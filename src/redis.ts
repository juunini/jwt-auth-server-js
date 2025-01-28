import type { Cluster } from "ioredis";
import type Redis from "ioredis";

interface GetRedisKeyProps {
  redisClient: Redis | Cluster;
  key: string;
}

export function getRedisKey({
  redisClient,
  key,
}: GetRedisKeyProps): Promise<string | null> {
  return redisClient!.get(key);
}

export function redisBlacklistTokenKey(token: string): string {
  return `jwtAuth:blacklist:${token}`;
}

interface SetRedisProps {
  redisClient: Redis | Cluster;
  key: string;
  value: string;
  expire: number;
}

export function setRedisKey({
  redisClient,
  key,
  value,
  expire,
}: SetRedisProps) {
  return redisClient.set(key, value, "EX", expire);
}
