import { expect, it } from "vitest";
import { streamGroup } from "../lib/stream-links";

const now = Date.parse("2026-11-06T12:00:00Z");
const recent = "2026-11-06T11:55:00Z";
const stream = { url: "https://example.com/video", live: true };

it("only groups recently reported live streams with no contradictory schedule", () => {
  expect(streamGroup(stream, recent, now)).toBe("live");
  expect(streamGroup(stream, "2026-11-06T11:44:00Z", now)).toBe("available");
  expect(streamGroup({ ...stream, end_time: "2026-11-06T11:59:00Z" }, recent, now)).toBe("available");
  expect(streamGroup({ ...stream, start_time: "2026-11-06T13:00:00Z" }, recent, now)).toBe("scheduled");
  expect(streamGroup({ url: stream.url }, recent, now)).toBe("available");
});
