import { NextRequest, NextResponse } from "next/server";

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
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return NextResponse.json({ message: "BACKEND_URL is not configured" }, { status: 500 });

  // Prevent Path Traversal / SSRF by rejecting unsafe path segments (including URL-encoded sequences)
  if (!path || path.length === 0 || path.some(isUnsafeSegment)) {
    return NextResponse.json({ message: "Invalid API path" }, { status: 400 });
  }

  const pathStr = path.join("/");
  const baseUrl = backendUrl.replace(/\/+$/, "");
  const targetUrl = new URL(`${baseUrl}/api/${pathStr}${request.nextUrl.search}`);

  if (!targetUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ message: "Invalid API path" }, { status: 400 });
  }

  let response: Response;
  try {
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "host" && key.toLowerCase() !== "connection") {
        headers.set(key, value);
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
  result.headers.set("content-type", response.headers.get("content-type") ?? "application/json");
  return result;
}

export async function GET(request: NextRequest, context: RouteContext) { return proxy(request, (await context.params).path); }
export async function POST(request: NextRequest, context: RouteContext) { return proxy(request, (await context.params).path); }
export async function PUT(request: NextRequest, context: RouteContext) { return proxy(request, (await context.params).path); }
export async function DELETE(request: NextRequest, context: RouteContext) { return proxy(request, (await context.params).path); }
