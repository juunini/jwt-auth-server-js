import Redis from "ioredis";

import type {
  AccessTokenConfig,
  Alg,
  JwtAuthConstructor,
  RefreshTokenConfig,
} from "./constructor";
import { login, type Payload } from "./login";
import { verify } from "./verify";

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

  login(payload: Payload) {
    return login(payload, this.secret, this.alg, this.accessTokenConfig, this.refreshTokenConfig);
  }

  verify(token: string): boolean {
    return verify(token, this.secret);
  }
}
