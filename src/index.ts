import Redis from "ioredis";

import type {
  AccessTokenConfig,
  Alg,
  JwtAuthConstructor,
  RefreshTokenConfig,
} from "./constructor";
import { login, type Payload } from "./login";
import { verify } from "./verify";
import { refresh } from "./refresh";
import { logout } from "./logout";

export default class JwtAuth {
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

  refresh({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) {
    return refresh({
      accessToken,
      refreshToken,
      secret: this.secret,
      alg: this.alg,
      accessTokenConfig: this.accessTokenConfig,
      refreshTokenConfig: this.refreshTokenConfig,
      redisClient: this.redisClient,
    });
  }

  async logout({ accessToken, refreshToken }: { accessToken: string; refreshToken: string }) {
    if (this.redisClient === undefined) {
      return;
    }

    await logout({
      accessToken,
      refreshToken,
      redisClient: this.redisClient,
    });
  }
}
