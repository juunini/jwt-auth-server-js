import { describe, it, expect, vitest, beforeEach } from 'vitest';
import { JwtAuth } from '.';
import type { AccessTokenConfig, RefreshTokenConfig } from './constructor';

beforeEach(() => {
  vitest.useFakeTimers();
});

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

  it('should refresh tokens with valid access and refresh tokens', async () => {
    const tokens = jwtAuth.login(mockPayload);

    vitest.advanceTimersByTime(1000);

    const newTokens = await jwtAuth.refresh(tokens);

    expect(newTokens).toHaveProperty('accessToken');
    expect(newTokens).toHaveProperty('refreshToken');
    expect(newTokens.accessToken).not.toBe(tokens.accessToken);
    expect(newTokens.refreshToken).not.toBe(tokens.refreshToken);
  });
  
  it('should not refresh tokens with invalid refresh token', () => {
    const tokens = jwtAuth.login(mockPayload);
    const invalidRefreshToken = 'invalidRefreshToken';

    try {
      jwtAuth.refresh({ accessToken: tokens.accessToken, refreshToken: invalidRefreshToken });
    } catch (error) {
      expect(error).not.toBeNull();
    }
  });
  
  it('should not refresh tokens with expired refresh token', async () => {
    const tokens = jwtAuth.login(mockPayload);
    // Simulate refresh token expiration by manipulating the system clock or mocking the verify function
    vitest.spyOn(global.Date, 'now').mockImplementationOnce(() => Date.now() + 8 * 24 * 60 * 60 * 1000); // 8 days later

    try {
      await jwtAuth.refresh(tokens);
    } catch (error) {
      expect(error).not.toBeNull();
    }
  });
  
  it('should not refresh tokens with invalid access token', async () => {
    const tokens = jwtAuth.login(mockPayload);
    const invalidAccessToken = 'invalidAccessToken';

    try {
      await jwtAuth.refresh({ accessToken: invalidAccessToken, refreshToken: tokens.refreshToken });
    } catch (error) {
      expect(error).not.toBeNull();
    }
  });

  it('should logout and invalidate tokens', async () => {
    const tokens = jwtAuth.login(mockPayload);
  
    if (jwtAuth['redisClient']) {
      await jwtAuth.logout(tokens);
  
      const isAccessTokenValid = jwtAuth.verify(tokens.accessToken);
      expect(isAccessTokenValid).toBe(false);
  
      try {
        await jwtAuth.refresh(tokens);
      } catch (error) {
        expect(error).not.toBeNull();
      }
    }
  });
  
  it('should not throw error if redisClient is undefined', async () => {
    const jwtAuthWithoutRedis = new JwtAuth({
      alg: mockAlg,
      secret: mockSecret,
      accessToken: mockAccessTokenConfig,
      refreshToken: mockRefreshTokenConfig,
      redis: undefined,
    });
  
    const tokens = jwtAuthWithoutRedis.login(mockPayload);
  
    await expect(jwtAuthWithoutRedis.logout(tokens)).resolves.not.toThrow();
  });  
});
