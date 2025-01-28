import type Redis from "ioredis";
import { decode, type JwtPayload } from "jsonwebtoken";

import type { AccessTokenConfig, Alg, RefreshTokenConfig } from "./constructor";
import { login } from "./login";

interface RefreshProps {
  accessToken: string;
  refreshToken: string;
  secret: string;
  alg: Alg;
  accessTokenConfig: AccessTokenConfig;
  refreshTokenConfig: RefreshTokenConfig;
  redisClient: Redis | undefined;
}

export async function refresh({
  accessToken,
  refreshToken,
  secret,
  alg,
  accessTokenConfig,
  refreshTokenConfig,
  redisClient,
}: RefreshProps) {
  if (redisClient) {
    await setBlacklistToken(redisClient, accessToken);
    await setBlacklistToken(redisClient, refreshToken);
  }

  const decodedAccessToken = decode(accessToken);
  const payload = getPayload(decodedAccessToken as JwtPayload);
  return login(payload, secret, alg, accessTokenConfig, refreshTokenConfig);
}

export function getExpire(token: string): number {
  const decodedToken = decode(token) as JwtPayload;
  const exp = decodedToken.exp || 0;
  return exp - Math.floor(Date.now() / 1000);
}

async function setBlacklistToken(
  redisClient: Redis,
  token: string,
) {
  const expire = getExpire(token);

  if (expire <= 0) {
    return
  }

  const key = `jwtAuth:blacklist:${token}`;
  await redisClient.set(key, "1", "EX", expire);
}

function getPayload(decodedToken: JwtPayload) {
  const { exp, iat, nbf, jti, ...payload } = decodedToken;
  return payload;
}
