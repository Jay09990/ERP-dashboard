## 2025-05-20 - BFF Route Proxy Path Traversal Vulnerability
**Vulnerability:** Next.js catch-all route handlers (`[...path]`) joining user-controlled path segments without validation allowed path traversal sequences (such as `..`) in requests, bypassing the `/api/` base prefix to reach arbitrary backend endpoints.
**Learning:** `fetch(`${backendUrl}/api/${pathStr}`)` normalizes relative URL paths (`/api/../admin` -> `/admin`), escaping the intended `/api/` proxy root unless path segments are explicitly sanitized.
**Prevention:** Sanitize path parameters in proxy routes by checking for `..`, `/`, `\`, and verifying that the target URL path starts with `/api/`.
