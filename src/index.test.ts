import { describe, it, expect, vitest } from 'vitest';
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

  it('should verify a valid token', () => {
    const tokens = jwtAuth.login(mockPayload);
    const isValid = jwtAuth.verify(tokens.accessToken);
    expect(isValid).toBe(true);
  });

  it('should not verify an invalid token', () => {
    const invalidToken = 'invalidToken';
    const isValid = jwtAuth.verify(invalidToken);
    expect(isValid).toBe(false);
  });

  it('should not verify an expired token', () => {
    const expiredToken = jwtAuth.login(mockPayload).accessToken;
    // Simulate token expiration by manipulating the system clock or mocking the verify function
    vitest.spyOn(global.Date, 'now').mockImplementationOnce(() => Date.now() + 10 * 60 * 1000); // 10 minutes later
    const isValid = jwtAuth.verify(expiredToken);
    expect(isValid).toBe(false);
  });
});
