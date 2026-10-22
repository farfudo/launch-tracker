import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { POST } from "../app/preferences/language/route";

describe("language preference endpoint", () => {
  it("persists a supported locale for all pages", async () => {
    const response = await POST(new NextRequest("https://example.com/preferences/language", {
      method: "POST", body: JSON.stringify({ locale: "en-GB" })
    }));
    expect(response.status).toBe(200);
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("launchskyline_locale=en-GB");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("Max-Age=31536000");
    expect(cookie.toLowerCase()).toContain("secure");
  });

  it("rejects invalid values without changing the cookie", async () => {
    for (const body of ["not-json", "null", JSON.stringify({ locale: "fr-FR" })]) {
      const response = await POST(new NextRequest("http://example.com/preferences/language", {
        method: "POST", body
      }));
      expect(response.status).toBe(400);
      expect(response.headers.get("set-cookie")).toBeNull();
    }
  });
});
