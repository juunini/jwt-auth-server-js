import type { Cluster } from "ioredis";
import type Redis from "ioredis";

interface GetRedisKeyProps {
  redisClient?: Redis;
  redisCluster?: Cluster;
  key: string;
}

export async function getRedisKey({
  redisClient,
  redisCluster,
  key,
}: GetRedisKeyProps): Promise<string | null> {
  return await (redisClient || redisCluster)!.get(key);
}

export function redisBlacklistTokenKey(token: string): string {
  return `jwtAuth:blacklist:${token}`;
}
