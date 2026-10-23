const SYNC_URL = "https://launch-tracker-ie09.onrender.com/api/v1/launches/sync";
const FAILURE_MESSAGES = Object.freeze({
  configuration_invalid: "SYNC_TOKEN missing or invalid.",
  request_setup_failed: "Sync request could not be prepared.",
  transport_failed: "Sync request failed or timed out; no automatic retry.",
  http_error: "Sync API returned an HTTP error.",
  invalid_json: "Sync API returned invalid JSON.",
  invalid_result: "Sync API returned an unexpected result.",
  redirect_rejected: "Sync API redirect rejected; credentials were not forwarded."
});
class SyncFailure extends Error {
  constructor(code, status) {
    super(status ? `Sync API returned HTTP ${status}.` : FAILURE_MESSAGES[code]);
    this.code = code;
    this.status = status;
  }
}

export async function runSync(env, request = fetch,
  makeSignal = () => AbortSignal.timeout(90_000)) {
  if (typeof env?.SYNC_TOKEN !== "string" || env.SYNC_TOKEN.length < 32
    || !/^[\x21-\x7e]+$/.test(env.SYNC_TOKEN)) {
    throw new SyncFailure("configuration_invalid");
  }
  let options;
  try {
    // Validate headers and timer separately from sending the request.
    const headers = new Headers({ "X-Sync-Token": env.SYNC_TOKEN, Accept: "application/json" });
    options = { method: "POST", headers: Object.fromEntries(headers),
      redirect: "manual", signal: makeSignal() };
  } catch {
    throw new SyncFailure("request_setup_failed");
  }
  let response;
  try {
    response = await request(SYNC_URL, options);
  } catch {
    throw new SyncFailure("transport_failed");
  }
  if (response.status >= 300 && response.status < 400) {
    throw new SyncFailure("redirect_rejected", response.status);
  }
  if (!response.ok) throw new SyncFailure("http_error", response.status);
  let data;
  try { data = await response.json(); }
  catch { throw new SyncFailure("invalid_json"); }
  if (!data || !Number.isInteger(data.imported) || data.imported < 0
    || typeof data.skipped !== "boolean"
    || (data.skipped && (data.imported !== 0 || !["in_progress", "recently_updated", "retry_wait"].includes(data.reason)))
    || (!data.skipped && (data.imported < 1 || data.reason !== null))) {
    throw new SyncFailure("invalid_result");
  }
  // Return and log only known fields, never tokens, headers or raw response bodies.
  return { imported: data.imported, skipped: data.skipped, reason: data.reason };
}

export async function executeScheduled(event, env, {
  request = fetch, log = entry => console.log(JSON.stringify(entry)),
  newId = () => crypto.randomUUID(), makeSignal = () => AbortSignal.timeout(90_000)
} = {}) {
  const context = {
    source: "cloudflare-worker", run_id: newId(),
    scheduled_at: new Date(event.scheduledTime).toISOString()
  };
  log({ ...context, phase: "started" });
  let result;
  try {
    result = await runSync(env, request, makeSignal);
  } catch (error) {
    // Do not log arbitrary exceptions, which may contain credentials.
    const known = error instanceof SyncFailure;
    log({ ...context, phase: "failed", error: known ? error.code : "internal_error",
      ...(known && error.status ? { http_status: error.status } : {}) });
    throw new Error("Scheduled synchronization failed; inspect API logs before retrying.");
  }
  log({ ...context, phase: "completed", ...result });
  return result;
}

export default {
  fetch() {
    return new Response("Scheduled synchronization only.", {
      status: 405, headers: { "Cache-Control": "no-store" }
    });
  },
  async scheduled(event, env) {
    await executeScheduled(event, env);
  }
};
