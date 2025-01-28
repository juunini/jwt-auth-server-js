import type { Cluster } from "ioredis";
import type Redis from "ioredis";
import { verify as jwtVerify } from "jsonwebtoken";
import { getRedisKey, redisBlacklistTokenKey } from "./redis";

interface VerifyProps {
  token: string;
  secret: string;
  redisClient?: Redis | Cluster;
}

export function verify({
  token,
  secret,
}: VerifyProps): boolean {
  try {
    jwtVerify(token, secret);
  } catch {
    return false;
  }

  return true;
}

export async function verifyAsync({
  token,
  secret,
  redisClient,
}: VerifyProps): Promise<boolean> {
  const isVerifiedToken = verify({ token, secret });

  if (!isVerifiedToken) {
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
