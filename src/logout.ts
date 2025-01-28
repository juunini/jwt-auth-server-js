import type Redis from "ioredis";
import { setBlacklistToken } from "./refresh";

export async function logout({
  accessToken,
  refreshToken,
  redisClient,
}: {
  accessToken: string;
  refreshToken: string;
  redisClient: Redis;
}) {
  await setBlacklistToken(redisClient, accessToken);
  await setBlacklistToken(redisClient, refreshToken);
}