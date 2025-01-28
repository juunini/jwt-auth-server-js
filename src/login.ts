import { sign } from "jsonwebtoken";

import type { AccessTokenConfig, Alg, RefreshTokenConfig } from "./constructor";

export type Payload = object;

export function login(
  payload: Payload,
  secret: string,
  alg: Alg,
  accessTokenConfig: AccessTokenConfig,
  refreshTokenConfig: RefreshTokenConfig,
) {
  return {
    accessToken: sign(
      payload,
      secret,
      {
        expiresIn: accessTokenConfig.expiresIn,
        algorithm: alg,
      }
    ),
    refreshToken: sign(
      {
        ...payload,
        jwtAuthTokenType: "refresh",
      },
      secret,
      {
        expiresIn: refreshTokenConfig.expiresIn,
        algorithm: alg,
      },
    ),
  };
}
