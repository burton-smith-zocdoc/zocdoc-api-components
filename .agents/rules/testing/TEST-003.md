# TEST-003: Use documented test scenarios

Tests and stories use the documented scenarios from `https://api-docs.zocdoc.com/guides/testing-data`. This ensures:

- No PHI in test code
- Predictable sandbox responses
- Alignment with API documentation

**Do:**

```ts
// Documented test ZIP codes
const TEST_ZIP_CODES = {
  withProviders: '10011',      // Returns providers
  noProviders: '99999',        // Returns empty
  invalidFormat: 'XXXXX',      // Returns error
};

// Documented test patient
const TEST_PATIENT = {
  first_name: 'Test',
  last_name: 'Patient',
  date_of_birth: '1990-01-15',
  sex_at_birth: 'female',
  phone_number: '2125551234',
  email_address: 'test@example.com',
};

it('shows empty state for ZIP with no providers', async () => {
  const el = await fixture(
    html`<zd-provider-search zip-code="${TEST_ZIP_CODES.noProviders}"></zd-provider-search>`
  );
  // ...
});
```

**Don't:**

```ts
// ❌ Arbitrary test data
const testPatient = {
  first_name: 'Alice',
  last_name: 'Johnson',
  phone_number: '5551234567',
};

// ❌ Real ZIP codes that might return real providers
const realZip = '10001';
```

Storybook stories render against the live sandbox using the configured `.env.local` token, so they exercise documented test scenarios with real (sandbox) responses.

See also: [PHI-002](../phi/PHI-002.md), [TEST-001](./TEST-001.md)
