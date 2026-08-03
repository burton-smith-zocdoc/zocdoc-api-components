# CLIENT-002: Token handling via getToken function

`getToken` is a function (or static string) so that a hardcoded sandbox token works today and the same components later work against a backend proxy or a PKCE flow by changing only what that function does.

```ts
export interface ZocdocConfig {
  baseUrl: string;
  getToken: string | (() => string | Promise<string>);
}
```

It is called per request; memoization is the consumer's responsibility. This keeps our side stateless and lets a 60-minute token refresh happen without our cooperation.

**Do:**

```ts
// Consumer-side: static token
configureZocdoc({
  baseUrl: 'https://api-developer-sandbox.zocdoc.com',
  getToken: import.meta.env.VITE_ZOCDOC_TOKEN,
});

// Consumer-side: dynamic token with refresh
const tokenCache = { value: null, expires: 0 };
configureZocdoc({
  baseUrl: 'https://api.zocdoc.com',
  getToken: async () => {
    if (Date.now() < tokenCache.expires) return tokenCache.value;
    const { token, expires_in } = await fetchToken();
    tokenCache.value = token;
    tokenCache.expires = Date.now() + (expires_in - 60) * 1000;
    return token;
  },
});
```

```ts
// Library-side: resolve it
async function resolveToken(getToken: string | (() => string | Promise<string>)) {
  return typeof getToken === 'function' ? getToken() : getToken;
}
```

**Don't:**

```ts
// ❌ Library minting tokens — violates auth guide
const token = await mintClientCredentialsToken(clientId, clientSecret);

// ❌ Token as plain config value — can't refresh
configureZocdoc({ baseUrl: '...', token: 'abc123' });
```

See also: [CLIENT-001](./CLIENT-001.md)
