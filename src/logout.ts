import type Redis from "ioredis";
import { setBlacklistToken } from "./refresh";
import type { Cluster } from "ioredis";

interface LogoutProps {
  accessToken: string;
  refreshToken: string;
  redisClient?: Redis;
  redisCluster?: Cluster;
}

export async function logout({
  accessToken,
  refreshToken,
  redisClient,
  redisCluster,
}: LogoutProps) {
  await setBlacklistToken({ redisClient, redisCluster, token: accessToken });
  await setBlacklistToken({ redisClient, redisCluster, token: refreshToken });
}
