import { NextRequest, NextResponse } from "next/server";

import { isLocale, localeCookie } from "../../../lib/i18n";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!isLocale(body?.locale)) {
    return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
  }

  const response = NextResponse.json({ locale: body.locale });
  response.cookies.set(localeCookie, body.locale, {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });
  return response;
}
