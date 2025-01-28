import type { ClusterNode, ClusterOptions, RedisOptions } from 'ioredis';
import type { StringValue } from 'ms';

export type Alg = 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512' | 'PS256' | 'PS384' | 'PS512' | 'ES256' | 'ES384' | 'ES512';
type ExpiresIn = StringValue | number;

export interface AccessTokenConfig {
  expiresIn: ExpiresIn;
}
export interface RefreshTokenConfig {
  expiresIn: ExpiresIn;
}
export interface RedisClusterProps {
  startupNodes: ClusterNode[];
  options?: ClusterOptions;
}

export interface JwtAuthConstructor {
  alg: Alg;
  secret: string;
  accessToken: AccessTokenConfig;
  refreshToken: RefreshTokenConfig;
  redis?: RedisOptions;
  redisCluster?: RedisClusterProps;
}
