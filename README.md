# JWT Auth for server-side

## Usage

### Init

```ts
// const { default: JWTAuth } = require('@juunini/jwt-auth-server');
import JWTAuth from '@juunini/jwt-auth-server';

const jwtAuth = new JWTAuth({
  alg: 'HS256', // default: HS256
  secret: 'your-awesome-secret',
  accessToken: {
    expire: '5m', // recommand 5m ~ 30m (default: 5m)
  },
  refreshToken: {
    expire: '1d', // recommand 1d ~ 7d (default: 1d)
  },
  redis: { // optional, but recommand
    host: '127.0.0.1',
    port: 6379,
    db: 0, // optional
    username: 'user', // optional
    password: 'pass', // optional
  },
  redisCluster: { // optional, if you use redis cluster
    startupNodes: [ ... ],
    options: { ... }, // optional
  }
});
```

- alg: see [jsonwebtoken algorithms supported](https://github.com/auth0/node-jsonwebtoken?tab=readme-ov-file#algorithms-supported)
- *Token.expiresIn: see [@vercel/ms](https://github.com/vercel/ms)
- redis: see [ioredis connect](https://github.com/redis/ioredis?tab=readme-ov-file#connect-to-redis)  
    or see [ioredis cluster](https://github.com/redis/ioredis?tab=readme-ov-file#cluster)

### Login

```ts
jwtAuth.login({ ...payload });
```

### Verify

```ts
// if you not set redis connection
jwtAuth.verify(accessToken);

// if you set redis connection
await jwtAuth.verify(refreshToken);
```

### Refresh

```ts
const newToken = await jwtAuth.refresh({ accessToken, refreshToken });
// newToken.accessToken
// newToken.refreshToken
```

### Logout

If you set redis connection, logout method will create blacklist old tokens.

```ts
await jwtAuth.logout({
  accessToken,
  refreshToken,
});
```
