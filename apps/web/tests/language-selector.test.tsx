// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LanguageSelector } from "../components/language-selector";
import { LocaleProvider } from "../components/locale-provider";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

let container: HTMLDivElement;
let root: Root;

beforeEach(async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  refresh.mockReset();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root.render(<LocaleProvider locale="pt-PT"><LanguageSelector /></LocaleProvider>);
  });
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

describe("language selector", () => {
  it("saves the preference and refreshes the current route", async () => {
    const save = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", save);
    await act(async () => {
      const select = container.querySelector("select")!;
      select.value = "en-GB";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(save).toHaveBeenCalledWith("/preferences/language", expect.objectContaining({
      method: "POST", body: JSON.stringify({ locale: "en-GB" })
    }));
    expect(refresh).toHaveBeenCalledOnce();
  });

  it("reports a failed preference save without refreshing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await act(async () => {
      const select = container.querySelector("select")!;
      select.value = "es-ES";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    });
    expect(refresh).not.toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]')?.textContent).toContain("Não foi possível mudar");
  });
});
