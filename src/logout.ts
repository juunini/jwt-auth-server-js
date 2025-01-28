import type Redis from "ioredis";
import { setBlacklistToken } from "./refresh";
import type { Cluster } from "ioredis";

interface LogoutProps {
  accessToken: string;
  refreshToken: string;
  redisClient: Redis | Cluster;
}

export async function logout({
  accessToken,
  refreshToken,
  redisClient,
}: LogoutProps) {
  await setBlacklistToken({ redisClient, token: accessToken });
  await setBlacklistToken({ redisClient, token: refreshToken });
}
