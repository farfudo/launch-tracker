import { unstable_cache } from "next/cache";
import { getDataStatus, getFilterOptions, getLaunch, getUpcomingLaunches, LaunchNotFoundError, type Launch, type LaunchDetail, type LaunchFilters, type FilterOptions, type DataStatus } from "./api";

// Only public API data is cached. Cookies, locale and browser favorites never enter this scope.
const origin = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
const preview = process.env.DESIGN_PREVIEW === "true";
function previewSeconds(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return preview && Number.isInteger(value) && value >= 1 && value <= fallback ? value : fallback;
}
export const CACHE_REVALIDATE_SECONDS = previewSeconds("PREVIEW_CACHE_SECONDS", 300);
export const CACHE_MAX_AGE_SECONDS = previewSeconds("PREVIEW_CACHE_MAX_AGE_SECONDS", 21600);
export type PublicCacheInfo = { checkedAt: string; revalidateSeconds: number };
export type CachedResult<T> = { value: T; cache: PublicCacheInfo };
export class CacheExpiredError extends Error {}
export class InvalidApiDataError extends Error {}

const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const date = (value: unknown) => typeof value === "string" && Number.isFinite(Date.parse(value));
const nullableText = (value: unknown) => value === null || typeof value === "string";
const optionalText = (value: unknown) => value === undefined || nullableText(value);
const launch = (value: unknown): value is Launch => record(value) && typeof value.id === "string" && /^[a-zA-Z0-9-]{1,128}$/.test(value.id) && typeof value.name === "string" && typeof value.status === "string" && date(value.net) && date(value.source_updated_at) && ["agency", "vehicle", "source_url", "launch_timezone"].every(key => nullableText(value[key])) && ["image_url", "image_credit", "image_license", "image_license_url", "image_title"].every(key => optionalText(value[key])) && [undefined, null, "vehicle", "launch"].includes(value.image_kind as string | null | undefined);
export function validateLaunches(value: unknown): asserts value is Launch[] {
  if (!Array.isArray(value) || value.length > 100 || !value.every(launch)) throw new InvalidApiDataError("Invalid launch list");
}
export function validateDetail(value: unknown): asserts value is LaunchDetail {
  if (!launch(value)) throw new InvalidApiDataError("Invalid mission detail");
  const object = value as unknown as Record<string, unknown>;
  const link = (item: unknown) => record(item) && typeof item.url === "string" && ["title", "source", "publisher"].every(key => optionalText(item[key])) && ["start_time", "end_time"].every(key => item[key] === undefined || item[key] === null || date(item[key])) && (item.live === undefined || item.live === null || typeof item.live === "boolean");
  if (!["mission_name", "mission_description", "location_name", "pad_name"].every(key => nullableText(object[key])) || !["window_start", "window_end"].every(key => object[key] === null || date(object[key])) || ["streams", "mission_links"].some(key => object[key] !== undefined && (!Array.isArray(object[key]) || !object[key].every(link)))) throw new InvalidApiDataError("Invalid mission detail");
}
function validateOptions(value: unknown): asserts value is FilterOptions {
  if (!record(value) || ![value.agencies, value.vehicles].every(items => Array.isArray(items) && items.every(item => typeof item === "string"))) throw new InvalidApiDataError("Invalid filters");
}
function validateStatus(value: unknown): asserts value is DataStatus {
  if (!record(value) || typeof value.source !== "string" || !Number.isInteger(value.cached_launches) || Number(value.cached_launches) < 0 || !(value.last_updated_at === null || date(value.last_updated_at)) || typeof value.stale !== "boolean") throw new InvalidApiDataError("Invalid data status");
}
export function usableResult<T>(result: CachedResult<T>, now = Date.now()): CachedResult<T> {
  const age = now - Date.parse(result.cache.checkedAt);
  if (!Number.isFinite(age) || age < -60000 || age >= CACHE_MAX_AGE_SECONDS * 1000) throw new CacheExpiredError("Saved response expired");
  return result;
}
function cached<T, A extends unknown[]>(kind: string, load: (...args: A) => Promise<T>, validate: (value: unknown) => void) {
  const read = unstable_cache(async (...args: A): Promise<CachedResult<T>> => {
    const value = await load(...args);
    validate(value); // Failed requests and malformed payloads never replace a valid snapshot.
    return { value, cache: { checkedAt: new Date().toISOString(), revalidateSeconds: CACHE_REVALIDATE_SECONDS } };
  }, ["public-api-v1", origin, kind, String(CACHE_REVALIDATE_SECONDS)], { revalidate: CACHE_REVALIDATE_SECONDS });
  return async (...args: A) => usableResult(await read(...args));
}
const readList = cached("list", (period: "upcoming" | "past") => getUpcomingLaunches(100, { period }), validateLaunches);
const readOptions = cached("filters", getFilterOptions, validateOptions);
const readStatus = cached("status", getDataStatus, validateStatus);
const readDetail = cached("detail", async (id: string): Promise<LaunchDetail | null> => {
  try { return await getLaunch(id); }
  catch (error) { if (error instanceof LaunchNotFoundError) return null; throw error; }
}, value => { if (value !== null) validateDetail(value); });

export async function getCachedLaunch(id: string) {
  if (!/^[a-zA-Z0-9-]{1,128}$/.test(id)) throw new InvalidApiDataError("Invalid mission identifier");
  const result = await readDetail(id);
  if (!result.value) throw new LaunchNotFoundError();
  return { ...result, value: result.value };
}
export async function getCachedStatus() {
  const result = await readStatus();
  const last = result.value.last_updated_at;
  return { ...result, value: { ...result.value, stale: !last || Date.now() - Date.parse(last) >= 21600000 } };
}
export async function getCachedLaunches(limit = 100, filters: LaunchFilters = {}): Promise<CachedResult<Launch[]>> {
  const period = filters.period === "past" ? "past" : "upcoming";
  // Free-text and entity searches stay authoritative: do not approximate them over a partial 100-row snapshot.
  if (filters.q || filters.agency || filters.vehicle) {
    const value = await getUpcomingLaunches(limit, { ...filters, period });
    validateLaunches(value);
    return { value, cache: { checkedAt: new Date().toISOString(), revalidateSeconds: 0 } };
  }
  const result = await readList(period);
  const now = Date.now();
  return { ...result, value: result.value.filter(item => period === "past" ? Date.parse(item.net) < now : Date.parse(item.net) >= now).slice(0, limit) };
}
export async function getCachedCalendarData(filters: LaunchFilters = {}) {
  const [launches, options] = await Promise.allSettled([getCachedLaunches(100, filters), readOptions()]);
  return {
    launches: launches.status === "fulfilled" ? launches.value.value : [],
    filterOptions: options.status === "fulfilled" ? options.value.value : { agencies: [], vehicles: [] },
    hasLaunchData: launches.status === "fulfilled", hasFilterOptions: options.status === "fulfilled",
    cache: [launches, options].flatMap(result => result.status === "fulfilled" && result.value.cache.revalidateSeconds ? [result.value.cache] : [])
  };
}
