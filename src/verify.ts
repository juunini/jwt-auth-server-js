import type { Cluster } from "ioredis";
import type Redis from "ioredis";
import { verify as jwtVerify } from "jsonwebtoken";
import { getRedisKey, redisBlacklistTokenKey } from "./redis";

interface VerifyProps {
  token: string;
  secret: string;
  redisClient?: Redis | Cluster;
}

export async function verify({
  token,
  secret,
  redisClient,
}: VerifyProps): Promise<boolean> {
  try {
    jwtVerify(token, secret);
  } catch {
    return false;
  }

  if (redisClient) {
    const isBlacklistToken = await getRedisKey({
      redisClient,
      key: redisBlacklistTokenKey(token),
    });

    if (isBlacklistToken) {
      return false;
    }
  }

  return true;
}
