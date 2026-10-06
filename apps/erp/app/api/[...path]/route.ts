import { NextRequest, NextResponse } from "next/server";
import { seedModeEnabled } from "@/config/seed-mode";
import { handleSeedRequest } from "@/lib/api/seed-handler";

type RouteContext = { params: Promise<{ path: string[] }> };

function isUnsafeSegment(seg: string): boolean {
  if (!seg || seg.includes("..") || seg.includes("/") || seg.includes("\\") || seg === ".") return true;
  let decoded = seg;
  try {
    for (let i = 0; i < 3; i++) {
      const prev = decoded;
      decoded = decodeURIComponent(decoded);
      if (
        decoded.includes("..") ||
        decoded.includes("/") ||
        decoded.includes("\\") ||
        decoded === "." ||
        decoded.includes("\0")
      ) {
        return true;
      }
      if (decoded === prev) break;
    }
  } catch {
    return true;
  }
  return false;
}

async function proxy(request: NextRequest, path: string[]) {
  // Prevent Path Traversal / SSRF by rejecting unsafe path segments (including URL-encoded sequences)
  if (!path || path.length === 0 || path.some(isUnsafeSegment)) {
    return NextResponse.json({ message: "Invalid API path" }, { status: 400 });
  }

  // Seed mode responds locally, so no API method in this branch can reach the backend.
  if (seedModeEnabled) return handleSeedRequest(request, path);

  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return NextResponse.json({ message: "BACKEND_URL is not configured" }, { status: 500 });

  const pathStr = path.join("/");
  const baseUrl = backendUrl.replace(/\/+$/, "");
  const targetUrl = new URL(`${baseUrl}/api/${pathStr}${request.nextUrl.search}`);

  if (!targetUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ message: "Invalid API path" }, { status: 400 });
  }

  let response: Response;
  try {
    const disallowedHeaders = new Set([
      "host",
      "connection",
      "keep-alive",
      "transfer-encoding",
      "upgrade",
      "proxy-authorization",
      "proxy-authenticate",
      "te",
      "trailer",
      "content-length",
    ]);
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (!disallowedHeaders.has(key.toLowerCase())) {
        // Strip control characters (CRLF/null bytes) to prevent header injection
        const cleanValue = value.replace(/[\r\n\0]/g, "").trim();
        if (cleanValue) {
          headers.set(key, cleanValue);
        }
      }
    });

    response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
    });
  } catch {
    return NextResponse.json({ message: "Backend API is unavailable" }, { status: 502 });
  }

  const result = new NextResponse(await response.text(), { status: response.status });
  const rawContentType = response.headers.get("content-type") ?? "";
  // Sanitize content-type header to strip control characters (CRLF/null bytes) and ensure safe MIME type header forwarding
  const cleanedContentType = rawContentType.replace(/[\r\n\0]/g, "").trim();
  const safeContentType = cleanedContentType.length > 0 ? cleanedContentType : "application/json";
  result.headers.set("content-type", safeContentType);
  return result;
}

export async function GET(request: NextRequest, context: RouteContext) { return proxy(request, (await context.params).path); }
export async function POST(request: NextRequest, context: RouteContext) { return proxy(request, (await context.params).path); }
export async function PUT(request: NextRequest, context: RouteContext) { return proxy(request, (await context.params).path); }
export async function DELETE(request: NextRequest, context: RouteContext) { return proxy(request, (await context.params).path); }
