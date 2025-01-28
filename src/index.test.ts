import { describe, it, expect } from 'vitest';
import { JwtAuth } from '.';
import type { AccessTokenConfig, RefreshTokenConfig } from './constructor';

describe('JwtAuth', () => {
  const mockPayload = { userId: 1 };
  const mockSecret = 'testSecret';
  const mockAccessTokenConfig: AccessTokenConfig = { expiresIn: '5m' };
  const mockRefreshTokenConfig: RefreshTokenConfig = { expiresIn: '7d' };
  const mockAlg = 'HS256';

  const jwtAuth = new JwtAuth({
    alg: mockAlg,
    secret: mockSecret,
    accessToken: mockAccessTokenConfig,
    refreshToken: mockRefreshTokenConfig,
    redis: undefined,
  });

  it('should generate access and refresh tokens', () => {
    const tokens = jwtAuth.login(mockPayload);
    expect(tokens).toHaveProperty('accessToken');
    expect(tokens).toHaveProperty('refreshToken');
  });

  it('should generate different tokens for different payloads', () => {
    const tokens1 = jwtAuth.login({ userId: 1 });
    const tokens2 = jwtAuth.login({ userId: 2 });
    expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
    expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
  });
});
