import Redis, { Cluster } from "ioredis";

import type {
  AccessTokenConfig,
  Alg,
  JwtAuthConstructor,
  RefreshTokenConfig,
} from "./constructor";
import { login, type Payload } from "./login";
import { verify, verifyAsync } from "./verify";
import { refresh, refreshAsync } from "./refresh";
import { logout } from "./logout";

export default class JWTAuth {
  private readonly alg: Alg;
  private readonly secret: string;
  private readonly accessTokenConfig: AccessTokenConfig;
  private readonly refreshTokenConfig: RefreshTokenConfig;
  private readonly redisClient: Redis | Cluster | undefined;

  constructor({
    alg = "HS256",
    secret,
    accessToken = { expiresIn: '5m' },
    refreshToken = { expiresIn: '1d' },
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
      this.redisClient = new Redis.Cluster(redisCluster.startupNodes, redisCluster.options);
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
    if (this.redisClient === undefined) {
      return refresh({
        accessToken,
        refreshToken,
        secret: this.secret,
        alg: this.alg,
        accessTokenConfig: this.accessTokenConfig,
        refreshTokenConfig: this.refreshTokenConfig,
      });
    }

    return refreshAsync({
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
