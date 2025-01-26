# JWT Auth for server-side

## Usage

### Init

```ts
import { jwtAuthInit } from '@juunini/jwt-auth-server';

jwtAuthInit({
  alg: 'HS256',
  typ: 'JWT',
  secret: 'your-awesome-secret',
  accessToken: {
    expire: '5m', // recommand 5m ~ 30m (min: 1m, max: 30m)
  },
  refreshToken: {
    expire: '1d',
    redis: { // optional, but recommand
      host: '127.0.0.1',
      port: 6379,
      db: 0, // optional
      username: 'user', // optional
      password: 'pass', // optional
    },
  },
});
```

### Login

```ts
import { jwtAuthLogin } from '@juunini/jwt-auth-server';

const { accessToken, refreshToken } = await jwtAuthLogin({
  payload: {
    // exp is automatically set
    iss: '',
    sub: '',
    aud: '',
    // ...
  },
});
```

### Validation

```ts
import { jwtAuthValidation } from '@juunini/jwt-auth-server';

if (jwtAuthValidation(token/* accessToken or refreshToken */)) {
  // Do something
}
```

### Refresh

```ts
const { newAccessToken, newRefreshTonen } = jwtAuthRefresh({
  accessToken: oldAccessToken,
  refreshToken: oldRefreshToken,
});
```

### Logout

You can use logout if you set redis connection info when `jwtAuthInit`

```ts
import { jwtAuthLogout } from '@juunini/jwt-auth-server';

await jwtAuthLogout({
  accessToken: '',
  refreshToken: '',
});
```
