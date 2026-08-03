# CLIENT-003: Typed error hierarchy

Map non-2xx responses to typed errors. `ZocdocAuthError` is distinct for 401, because an expired token is the most common failure and deserves a different message from "no providers found".

**Do:**

```ts
export class ZocdocError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ZocdocError';
  }
}

export class ZocdocAuthError extends ZocdocError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTH_ERROR');
    this.name = 'ZocdocAuthError';
  }
}

export class ZocdocNotFoundError extends ZocdocError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'ZocdocNotFoundError';
  }
}

function mapError(response: Response): ZocdocError {
  if (response.status === 401) return new ZocdocAuthError();
  if (response.status === 404) return new ZocdocNotFoundError();
  return new ZocdocError(`Request failed: ${response.statusText}`, response.status);
}
```

```ts
// Component can handle specific errors
try {
  const data = await searchProviderLocations(params);
} catch (error) {
  if (error instanceof ZocdocAuthError) {
    this.errorMessage = 'Your session has expired. Please refresh.';
  } else {
    this.errorMessage = 'Unable to load providers. Please try again.';
  }
}
```

**Don't:**

```ts
// ❌ Generic errors with no type discrimination
throw new Error(`HTTP ${response.status}`);

// ❌ Exposing raw API error messages to users (may contain PHI)
throw new Error(await response.text());
```

See also: [CLIENT-001](./CLIENT-001.md), [PHI-001](../phi/PHI-001.md)
