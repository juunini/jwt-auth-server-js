import type { Cluster } from "ioredis";
import type Redis from "ioredis";

interface GetRedisKeyProps {
  redisClient?: Redis;
  redisCluster?: Cluster;
  key: string;
}

export function getRedisKey({
  redisClient,
  redisCluster,
  key,
}: GetRedisKeyProps): Promise<string | null> {
  return (redisClient || redisCluster)!.get(key);
}

export function redisBlacklistTokenKey(token: string): string {
  return `jwtAuth:blacklist:${token}`;
}

interface SetRedisProps {
  redisClient?: Redis;
  redisCluster?: Cluster;
  key: string;
  value: string;
  expire: number;
}

export function setRedisKey({
  redisClient,
  redisCluster,
  key,
  value,
  expire,
}: SetRedisProps) {
  return (redisClient || redisCluster)!.set(key, value, "EX", expire);
}
