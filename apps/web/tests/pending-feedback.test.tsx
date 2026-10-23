// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { SearchForm, Spinner } from "../components/pending-feedback";
import { renderToStaticMarkup } from "react-dom/server";
import { LocaleProvider } from "../components/locale-provider";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

it("uses an orbital indicator in controls and a rising rocket for page loading", () => {
  const orbit = renderToStaticMarkup(<Spinner />);
  const launch = renderToStaticMarkup(<Spinner variant="launch" />);
  expect(orbit).toContain('rocket-orbit-traveller');
  expect(orbit).toContain('rocket-orbit-track');
  expect(orbit).toContain('aria-hidden="true"');
  expect(launch).toContain('rocket-loader-launch');
  expect(launch).not.toContain('rocket-orbit-traveller');
});

it("shows pending feedback, preserves filters and prevents repeat submit until navigation ends", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let finish!: () => void;
  push.mockReturnValue(new Promise<void>(resolve => { finish = resolve; }));
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => root.render(<LocaleProvider locale="pt-PT"><SearchForm><input name="period" defaultValue="past" /><input name="q" defaultValue="Falcon" /></SearchForm></LocaleProvider>));
    const form = container.querySelector("form")!;
    await act(async () => form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    expect(container.querySelector("button")!.disabled).toBe(true);
    expect(container.querySelector(".action-spinner")).not.toBeNull();
    expect(container.querySelector(".rocket-loader svg")).not.toBeNull();
    expect(container.querySelector(".rocket-loader")!.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector(".rocket-loader-flame")).not.toBeNull();
    expect(form.getAttribute("aria-busy")).toBe("true");
    const url = new URL(push.mock.calls[0][0], "http://localhost");
    expect(Object.fromEntries(url.searchParams)).toEqual({ period: "past", q: "Falcon" });
    await act(async () => form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
    expect(push).toHaveBeenCalledTimes(1);
    await act(async () => finish());
    expect(container.querySelector("button")!.disabled).toBe(false);
    expect(container.querySelector(".action-spinner")).toBeNull();
  } finally {
    await act(async () => root.unmount());
    container.remove();
  }
});
