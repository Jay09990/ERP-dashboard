## 2025-05-20 - BFF Route Proxy Path Traversal Vulnerability
**Vulnerability:** Next.js catch-all route handlers (`[...path]`) joining user-controlled path segments without validation allowed path traversal sequences (such as `..`) in requests, bypassing the `/api/` base prefix to reach arbitrary backend endpoints.
**Learning:** `fetch(`${backendUrl}/api/${pathStr}`)` normalizes relative URL paths (`/api/../admin` -> `/admin`), escaping the intended `/api/` proxy root unless path segments are explicitly sanitized.
**Prevention:** Sanitize path parameters in proxy routes by checking for `..`, `/`, `\`, and verifying that the target URL path starts with `/api/`.

## 2025-05-21 - URL-Encoded Path Traversal in BFF Route Proxies
**Vulnerability:** Checking raw path segments in `[...path]` catch-all proxy routes allowed URL-encoded (or double-encoded) traversal sequences (e.g. `%2e%2e` or `%252e%252e`) to bypass string checks (`seg.includes("..")`). When passed into `new URL()`, Node's URL parser decodes `%2e%2e` to `..` during path normalization, leading to SSRF/path traversal.
**Learning:** Checking raw strings without decoding allows encoded sequences to bypass validation until they reach downstream URL parsers.
**Prevention:** Always decode path segments (including handling multi-pass encoding safely with try-catch) before checking for traversal tokens (`..`, `.`, `/`, `\`, `\0`).

## 2025-05-22 - URL-Encoded Open Redirect Bypass in Login Next Parameter
**Vulnerability:** `isSafeRedirect` checked raw strings for `//` or `\`, allowing URL-encoded payloads like `/%2f%2fevil.com` or `/%5cevil.com` to bypass safety checks before being processed by navigation routing.
**Learning:** Checking relative URLs for protocol-relative slashes or backslashes without decoding encoded components permits open redirect vectors.
**Prevention:** Perform multi-pass `decodeURIComponent` (safely handled with try-catch) before validating path prefix, slash patterns, and control characters.
