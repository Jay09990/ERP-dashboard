# API Test Report

## Summary

API proxy and client tests were added using Vitest and `next-test-api-route-handler` (NTARH). The frontend apps expose catch-all Next.js route handlers that proxy requests to an Express backend maintained outside this repository.

## Coverage

### ERP API proxy

- Iterates every unique API path declared in `apps/erp/lib/api/endpoints.ts` and verifies GET requests are forwarded to the configured backend URL.
- Verifies GET, POST, PUT, and DELETE proxy behavior, including request body, query string, status, and response content type forwarding.
- Verifies malformed or unsafe paths are rejected without contacting the backend.
- Verifies explicit errors for missing backend configuration and unavailable backend.
- Exercises seed mode: fixture reads, read-only write rejection, and demo login response.

### Admin API proxy

- Iterates every unique API path declared in `apps/admin/lib/api/endpoints.ts` and verifies GET requests are forwarded.
- Verifies unsafe path rejection and explicit missing-backend configuration errors.

### Shared API client

- Tests shared resource hook GET/list/detail behavior and create/update/delete HTTP method mapping.
- Existing workspace API tests also cover the shared API client and selected ERP/Admin feature API hooks.

## Results

Validated with:

```text
pnpm test       PASS — 63 tests across 24 test files
pnpm typecheck  PASS — all workspace packages and apps
```

The route-specific NTARH suites contain 17 tests: 14 ERP proxy/seed-mode tests and 3 Admin proxy tests. Registry paths are enumerated during the tests, so new registered endpoints are included automatically.

## Scope and limitations

- Outbound backend requests are stubbed. These tests verify frontend proxy routing and contract behavior, not the Express backend's domain logic, database behavior, or live-service integration.
- Only endpoint paths registered in the frontend endpoint maps are covered by the automatic all-path checks. Any backend endpoint not registered there requires a frontend registry entry or a separate integration test.
- Feature API-hook tests cover selected API modules and are not an exhaustive behavioral test of every exported hook.
