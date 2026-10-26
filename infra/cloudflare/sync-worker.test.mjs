import { test } from "node:test";
import assert from "node:assert/strict";
import worker, { runSync, executeScheduled } from "./sync-worker.mjs";

const env = { SYNC_TOKEN: "test-only-".padEnd(64, "0") };
const response = value => new Response(JSON.stringify(value));

test("90 second timeout aborts one POST with safe correlated failure and no retry", async t => {
  const controller = new AbortController();
  t.mock.method(AbortSignal, "timeout", milliseconds => {
    assert.equal(milliseconds, 90_000);
    return controller.signal;
  });
  const logs = [];
  let calls = 0;
  await assert.rejects(executeScheduled({ scheduledTime: 0 }, env, {
    newId: () => "timeout-test", log: entry => logs.push(entry),
    request: async (_url, { signal }) => {
      calls++;
      assert.equal(signal, controller.signal);
      return new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), { once: true });
        controller.abort(new Error(env.SYNC_TOKEN));
      });
    }
  }), /inspect API logs before retrying/);
  assert.equal(calls, 1);
  assert.deepEqual(logs.map(entry => entry.phase), ["started", "failed"]);
  assert.equal(logs[1].error, "transport_failed");
  assert.ok(!JSON.stringify(logs).includes(env.SYNC_TOKEN));
});

for (const result of [{ imported: 100, skipped: false, reason: null },
  { imported: 0, skipped: true, reason: "in_progress" },
  { imported: 0, skipped: true, reason: "recently_updated" }]) {
  test(`scheduled execution has correlated start and result: ${result.reason ?? "imported"}`, async () => {
    const logs = [];
    let calls = 0;
    assert.deepEqual(await executeScheduled({ scheduledTime: 0 }, env, {
      newId: () => "local-test-run", log: entry => logs.push(entry),
      request: async () => { calls++; return response(result); }
    }), result);
    const context = { source: "cloudflare-worker", run_id: "local-test-run",
      scheduled_at: "1970-01-01T00:00:00.000Z" };
    assert.deepEqual(logs, [{ ...context, phase: "started" },
      { ...context, phase: "completed", ...result }]);
    assert.equal(calls, 1);
    assert.ok(!JSON.stringify(logs).includes(env.SYNC_TOKEN));
  });
}
test("scheduled failure is explicit, sanitized and not retried", async () => {
  const logs = [];
  let calls = 0;
  await assert.rejects(executeScheduled({ scheduledTime: 0 }, env, {
    newId: () => "failed-test-run", log: entry => logs.push(entry),
    request: async () => { calls++; throw new Error(env.SYNC_TOKEN); }
  }), /inspect API logs before retrying/);
  assert.equal(calls, 1);
  assert.deepEqual(logs.map(entry => entry.phase), ["started", "failed"]);
  assert.equal(logs[1].error, "transport_failed");
  assert.ok(!JSON.stringify(logs).includes(env.SYNC_TOKEN));
});

test("public HTTP requests cannot initiate synchronization", async () => {
  assert.equal(worker.fetch().status, 405);
});
for (const [code, settings, status] of [
  ["configuration_invalid", { env: {} }],
  ["configuration_invalid", { env: { SYNC_TOKEN: env.SYNC_TOKEN + "\n" } }],
  ["request_setup_failed", { makeSignal: () => { throw new Error(env.SYNC_TOKEN); } }],
  ["transport_failed", { request: async () => { throw new Error(env.SYNC_TOKEN); } }],
  ["http_error", { request: async () => new Response(env.SYNC_TOKEN, { status: 401 }) }, 401],
  ["http_error", { request: async () => new Response(env.SYNC_TOKEN, { status: 503 }) }, 503],
  ["invalid_json", { request: async () => new Response(env.SYNC_TOKEN) }],
  ["invalid_result", { request: async () => response({ private: env.SYNC_TOKEN }) }]
]) {
  test(`safe scheduled diagnostic: ${code} ${status ?? ""}`, async () => {
    const logs = [];
    let calls = 0;
    await assert.rejects(executeScheduled({ scheduledTime: 0 }, settings.env ?? env, {
      newId: () => "diagnostic-test", log: entry => logs.push(entry),
      request: async (...args) => {
        calls++;
        return settings.request ? settings.request(...args) : response({ imported: 100, skipped: false, reason: null });
      },
      ...(settings.makeSignal ? { makeSignal: settings.makeSignal } : {})
    }), /inspect API logs before retrying/);
    assert.equal(logs[1].error, code);
    assert.equal(logs[1].http_status, status);
    assert.equal(calls, ["configuration_invalid", "request_setup_failed"].includes(code) ? 0 : 1);
    assert.ok(!JSON.stringify(logs).includes(env.SYNC_TOKEN));
  });
}
test("missing token prevents outbound request", async () => {
  await assert.rejects(runSync({}, () => assert.fail("must not call")), /missing/);
});
test("fixed HTTPS destination, timeout, token header and redirect rejection", async () => {
  const result = await runSync(env, async (url, options) => {
    assert.equal(url, "https://launch-tracker-ie09.onrender.com/api/v1/launches/sync");
    assert.equal(options.method, "POST");
    assert.equal(new Headers(options.headers).get("X-Sync-Token"), env.SYNC_TOKEN);
    assert.equal(options.redirect, "manual");
    assert.ok(options.signal instanceof AbortSignal);
    return response({ imported: 100, skipped: false, reason: null, secret: "not returned" });
  });
  assert.deepEqual(result, { imported: 100, skipped: false, reason: null });
});
for (const status of [301, 302, 303, 307, 308]) {
  test(`rejects redirect ${status} without following or exposing Location`, async () => {
    let calls = 0;
    const logs = [];
    await assert.rejects(executeScheduled({ scheduledTime: 0 }, env, {
      newId: () => "redirect-test", log: entry => logs.push(entry),
      request: async (_url, options) => {
        calls++;
        assert.equal(options.redirect, "manual");
        return new Response(null, { status, headers: { Location: "https://other.example/" + env.SYNC_TOKEN } });
      }
    }), /inspect API logs before retrying/);
    assert.equal(calls, 1);
    assert.equal(logs[1].error, "redirect_rejected");
    assert.equal(logs[1].http_status, status);
    assert.ok(!JSON.stringify(logs).includes(env.SYNC_TOKEN));
    assert.ok(!JSON.stringify(logs).includes("other.example"));
  });
}
for (const reason of ["in_progress", "recently_updated", "retry_wait"]) {
  test(`accepts protected skip: ${reason}`, async () => {
    assert.deepEqual(await runSync(env, async () => response({ imported: 0, skipped: true, reason })),
      { imported: 0, skipped: true, reason });
  });
}
test("HTTP errors are not retried and response body is not exposed", async () => {
  let calls = 0;
  await assert.rejects(runSync(env, async () => {
    calls++; return new Response("private error", { status: 503 });
  }), { message: "Sync API returned HTTP 503." });
  assert.equal(calls, 1);
});
test("network failure is sanitized and not retried", async () => {
  let calls = 0;
  await assert.rejects(runSync(env, async () => {
    calls++; throw new Error(env.SYNC_TOKEN);
  }), { message: "Sync request failed or timed out; no automatic retry." });
  assert.equal(calls, 1);
});
test("rejects legacy, malformed and inconsistent responses", async () => {
  for (const value of [null, { imported: 100 }, { imported: -1, skipped: false },
    { imported: 10, skipped: true, reason: "in_progress" },
    { imported: 0, skipped: true, reason: "unknown" },
    { imported: 0, skipped: false, reason: null }]) {
    await assert.rejects(runSync(env, async () => response(value)), /unexpected/);
  }
  await assert.rejects(runSync(env, async () => new Response("not JSON")), /invalid JSON/);
});
