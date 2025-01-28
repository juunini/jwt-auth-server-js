import Redis from "ioredis";

import type { AccessTokenConfig, Alg, JwtAuthConstructor, RefreshTokenConfig } from "./constructor";

export class JwtAuth {
  private readonly alg: Alg;
  private readonly secret: string;
  private readonly accessTokenConfig: AccessTokenConfig;
  private readonly refreshTokenConfig: RefreshTokenConfig;
  private readonly redisClient: Redis | undefined;

  constructor({
    alg,
    secret,
    accessToken,
    refreshToken,
    redis,
  }: JwtAuthConstructor) {
    this.alg = alg;
    this.secret = secret;
    this.accessTokenConfig = accessToken;
    this.refreshTokenConfig = refreshToken;

    if (redis) {
      this.redisClient = new Redis(redis);
    }
  }
}

export async function jwtAuthLogin() {
  console.log('jwtAuthLogin');
}

export async function jwtAuthValidation() {
  console.log('jwtAuthValidation');
}

export async function jwtAuthRefresh() {
  console.log('jwtAuthRefresh');
}

export async function jwtAuthLogout() {
  console.log('jwtAuthLogout');
}
