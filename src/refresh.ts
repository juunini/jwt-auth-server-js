import type Redis from "ioredis";
import { decode, type JwtPayload } from "jsonwebtoken";

import type { AccessTokenConfig, Alg, RefreshTokenConfig } from "./constructor";
import { login } from "./login";
import { redisBlacklistTokenKey, setRedisKey } from "./redis";
import type { Cluster } from "ioredis";

interface RefreshProps {
  accessToken: string;
  refreshToken: string;
  secret: string;
  alg: Alg;
  accessTokenConfig: AccessTokenConfig;
  refreshTokenConfig: RefreshTokenConfig;
  redisClient: Redis | undefined;
  redisCluster: Cluster | undefined;
}

export async function refresh({
  accessToken,
  refreshToken,
  secret,
  alg,
  accessTokenConfig,
  refreshTokenConfig,
  redisClient,
  redisCluster,
}: RefreshProps) {
  if (redisClient || redisCluster) {
    await setBlacklistToken({ redisClient, redisCluster, token: accessToken });
    await setBlacklistToken({ redisClient, redisCluster, token: refreshToken });
  }

  const decodedAccessToken = decode(accessToken);
  const payload = getPayload(decodedAccessToken as JwtPayload);
  return login(payload, secret, alg, accessTokenConfig, refreshTokenConfig);
}

function getExpire(token: string): number {
  const decodedToken = decode(token) as JwtPayload;
  const exp = decodedToken.exp || 0;
  return exp - Math.floor(Date.now() / 1000);
}

interface SetBlacklistTokenProps {
  redisClient?: Redis;
  redisCluster?: Cluster;
  token: string;
}

export async function setBlacklistToken({
  redisClient,
  redisCluster,
  token,
}: SetBlacklistTokenProps) {
  const expire = getExpire(token);

  if (expire <= 0) {
    return;
  }

  const key = redisBlacklistTokenKey(token);
  await setRedisKey({ redisClient, redisCluster, key, value: "1", expire });
}

function getPayload(decodedToken: JwtPayload) {
  const { exp, iat, nbf, jti, ...payload } = decodedToken;
  return payload;
}
