import Redis, { Cluster } from "ioredis";

import type {
  AccessTokenConfig,
  Alg,
  JwtAuthConstructor,
  RefreshTokenConfig,
} from "./constructor";
import { login, type Payload } from "./login";
import { verify, verifyAsync } from "./verify";
import { refresh } from "./refresh";
import { logout } from "./logout";

export default class JWTAuth {
  private readonly alg: Alg;
  private readonly secret: string;
  private readonly accessTokenConfig: AccessTokenConfig;
  private readonly refreshTokenConfig: RefreshTokenConfig;
  private readonly redisClient: Redis | Cluster | undefined;

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

    if (redis && redis.clusterStartupNodes === undefined) {
      this.redisClient = new Redis(redis);
    }

    if (redis && redis.clusterStartupNodes) {
      this.redisClient = new Redis.Cluster(redis.clusterStartupNodes, redis.clusterOptions);
    }
  }

  login(payload: Payload) {
    return login(payload, this.secret, this.alg, this.accessTokenConfig, this.refreshTokenConfig);
  }

  verify(token: string): boolean | Promise<boolean> {
    if (this.redisClient === undefined) {
      return verify({
        token,
        secret: this.secret,
      });
    }

    return verifyAsync({
      token,
      secret: this.secret,
      redisClient: this.redisClient,
    });
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
