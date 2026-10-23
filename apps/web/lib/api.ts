export type Launch = {
  id: string;
  name: string;
  status: string;
  net: string;
  agency: string | null;
  vehicle: string | null;
  source_url: string | null;
  source_updated_at: string;
  launch_timezone: string | null;
  image_url?: string | null;
  image_credit?: string | null;
  image_license?: string | null;
  image_license_url?: string | null;
  image_kind?: "vehicle" | "launch" | null;
  image_title?: string | null;
};

export type FilterOptions = {
  agencies: string[];
  vehicles: string[];
};

export type LaunchDetail = Launch & {
  streams?: MissionLink[];
  mission_links?: MissionLink[];
  mission_name: string | null;
  mission_description: string | null;
  pad_name: string | null;
  location_name: string | null;
  window_start: string | null;
  window_end: string | null;
  image_url: string | null;
  image_credit: string | null;
  image_license: string | null;
  image_license_url: string | null;
  image_kind: "vehicle" | "launch" | null;
  image_title: string | null;
};

export type MissionLink = {
  url: string;
  title?: string | null;
  source?: string | null;
  publisher?: string | null;
  live?: boolean | null;
  start_time?: string | null;
  end_time?: string | null;
};

export type DataStatus = {
  source: string;
  cached_launches: number;
  last_updated_at: string | null;
  stale: boolean;
};

export async function getDataStatus(): Promise<DataStatus> {
  const response = await fetchApi(`${apiBaseUrl}/api/v1/data-status`);
  if (!response.ok) throw new Error("Unable to retrieve data status.");
  return response.json() as Promise<DataStatus>;
}

const apiBaseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export const API_TIMEOUT_MS = 20_000;

function fetchApi(url: string) {
  return fetch(url, { cache: "no-store", signal: AbortSignal.timeout(API_TIMEOUT_MS) });
}

export type LaunchFilters = {
  q?: string;
  agency?: string;
  vehicle?: string;
  period?: "upcoming" | "past";
};

export class LaunchNotFoundError extends Error {
  constructor() { super("Launch not found."); }
}

export async function getCalendarData(filters: LaunchFilters = {}) {
  const [launches, options] = await Promise.allSettled([
    getUpcomingLaunches(100, filters), getFilterOptions()
  ]);
  return {
    launches: launches.status === "fulfilled" ? launches.value : [],
    filterOptions: options.status === "fulfilled" ? options.value : { agencies: [], vehicles: [] },
    hasLaunchData: launches.status === "fulfilled",
    hasFilterOptions: options.status === "fulfilled"
  };
}

export async function getUpcomingLaunches(limit = 20, filters: LaunchFilters = {}): Promise<Launch[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const response = await fetchApi(`${apiBaseUrl}/api/v1/launches?${params.toString()}`);

  if (!response.ok) {
    throw new Error("Unable to retrieve launch data.");
  }

  return response.json() as Promise<Launch[]>;
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const response = await fetchApi(`${apiBaseUrl}/api/v1/launches/filter-options`);
  if (!response.ok) throw new Error("Unable to retrieve filter options.");
  return response.json() as Promise<FilterOptions>;
}

export async function getLaunch(launchId: string): Promise<LaunchDetail> {
  const response = await fetchApi(`${apiBaseUrl}/api/v1/launches/${launchId}`);
  if (response.status === 404) throw new LaunchNotFoundError();
  if (!response.ok) throw new Error("Unable to retrieve launch.");
  return response.json() as Promise<LaunchDetail>;
}
