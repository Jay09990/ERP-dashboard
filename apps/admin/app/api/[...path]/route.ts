import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, path: string[]) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return NextResponse.json({ message: "BACKEND_URL is not configured" }, { status: 500 });

  const pathStr = path.join("/");

  let response: Response;
  try {
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "host" && key.toLowerCase() !== "connection") {
        headers.set(key, value);
      }
    });

    response = await fetch(`${backendUrl}/api/${pathStr}${request.nextUrl.search}`, {
      method: request.method,
      headers: headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
    });
  } catch {
    return NextResponse.json({ message: "Backend API is unavailable" }, { status: 502 });
  }

  const result = new NextResponse(await response.text(), { status: response.status });
  const setCookies = response.headers.getSetCookie();

  for (const cookie of setCookies) {
    result.headers.append("set-cookie", cookie);
  }

  if (response.status === 401 || pathStr === "admin/logout" || pathStr === "auth/logout") {
    result.cookies.set("connect.sid", "", {
      path: "/",
      expires: new Date(0),
      httpOnly: true,
    });
  }

  result.headers.set("content-type", response.headers.get("content-type") ?? "application/json");
  return result;
}

export async function GET(request: NextRequest, context: RouteContext) { return proxy(request, (await context.params).path); }
export async function POST(request: NextRequest, context: RouteContext) { return proxy(request, (await context.params).path); }
export async function PUT(request: NextRequest, context: RouteContext) { return proxy(request, (await context.params).path); }
export async function DELETE(request: NextRequest, context: RouteContext) { return proxy(request, (await context.params).path); }