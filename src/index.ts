import Redis, { Cluster } from "ioredis";

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
  private readonly redisCluster: Cluster | undefined;

  constructor({
    alg,
    secret,
    accessToken,
    refreshToken,
    redis,
    redisCluster,
  }: JwtAuthConstructor) {
    this.alg = alg;
    this.secret = secret;
    this.accessTokenConfig = accessToken;
    this.refreshTokenConfig = refreshToken;

    if (redis) {
      this.redisClient = new Redis(redis);
    }

    if (redisCluster) {
      this.redisCluster = new Redis.Cluster(redisCluster.startupNodes, redisCluster.options);
    }
  }

  login(payload: Payload) {
    return login(payload, this.secret, this.alg, this.accessTokenConfig, this.refreshTokenConfig);
  }

  verify(token: string): Promise<boolean> {
    return verify({
      token,
      secret: this.secret,
      redisClient: this.redisClient,
      redisCluster: this.redisCluster,
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
