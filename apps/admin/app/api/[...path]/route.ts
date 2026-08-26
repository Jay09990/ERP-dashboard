import { NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, path: string[]) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) return NextResponse.json({ message: "BACKEND_URL is not configured" }, { status: 500 });

  let response: Response;
  try {
    response = await fetch(`${backendUrl}/api/${path.join("/")}${request.nextUrl.search}`, {
      method: request.method,
      headers: {
        cookie: request.headers.get("cookie") ?? "",
        "content-type": request.headers.get("content-type") ?? "application/json",
      },
      body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
    });
  } catch {
    return NextResponse.json({ message: "Backend API is unavailable" }, { status: 502 });
  }
  const result = new NextResponse(await response.text(), { status: response.status });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) result.headers.set("set-cookie", setCookie);
  result.headers.set("content-type", response.headers.get("content-type") ?? "application/json");
  return result;
}

export async function GET(request: NextRequest, context: RouteContext) { return proxy(request, (await context.params).path); }
export async function POST(request: NextRequest, context: RouteContext) { return proxy(request, (await context.params).path); }
export async function PUT(request: NextRequest, context: RouteContext) { return proxy(request, (await context.params).path); }
export async function DELETE(request: NextRequest, context: RouteContext) { return proxy(request, (await context.params).path); }