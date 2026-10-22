// @vitest-environment jsdom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { AgencyFilters } from "../components/agency-filters";
import { LocaleProvider } from "../components/locale-provider";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({push}) }));
vi.mock("next/link", () => ({default: ({prefetch, children, ...props}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {prefetch?: boolean}) => { void prefetch; return <a {...props}>{children}</a>; }}));

it("shows loading immediately and preserves the other filters until navigation completes", async () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  let complete!: () => void;
  push.mockReturnValue(new Promise<void>(resolve => { complete = resolve; }));
  const container = document.createElement("div"); document.body.append(container);
  const root = createRoot(container);
  try {
    await act(async () => root.render(<LocaleProvider locale="en-GB"><AgencyFilters agencies={["SpaceX"]} filters={{q:"Starlink",vehicle:"Falcon",favorites:"1"}} /></LocaleProvider>));
    await act(async () => container.querySelectorAll("a")[1].click());
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(container.querySelector('[role="status"]')!.textContent).toBe("Updating launches…");
    const href = new URL(push.mock.calls[0][0], "http://localhost");
    expect(Object.fromEntries(href.searchParams)).toEqual({q:"Starlink",vehicle:"Falcon",favorites:"1",agency:"SpaceX"});
    await act(async () => complete());
    expect(container.querySelector('[aria-busy="true"]')).toBeNull();
    expect(container.querySelector('[role="status"]')!.textContent).toBe("");
  } finally { await act(async () => root.unmount()); container.remove(); }
});
