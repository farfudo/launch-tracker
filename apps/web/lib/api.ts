export type Launch = {
  id: string;
  name: string;
  status: string;
  net: string;
  agency: string | null;
  vehicle: string | null;
  source_updated_at: string;
};

export type FilterOptions = {
  agencies: string[];
  vehicles: string[];
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export type LaunchFilters = {
  q?: string;
  agency?: string;
  vehicle?: string;
};

export async function getUpcomingLaunches(limit = 20, filters: LaunchFilters = {}): Promise<Launch[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  for (const [key, value] of Object.entries(filters)) {
    if (value) params.set(key, value);
  }
  const response = await fetch(`${apiBaseUrl}/api/v1/launches?${params.toString()}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Unable to retrieve launch data.");
  }

  return response.json() as Promise<Launch[]>;
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const response = await fetch(`${apiBaseUrl}/api/v1/launches/filter-options`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to retrieve filter options.");
  return response.json() as Promise<FilterOptions>;
}

export async function getLaunch(launchId: string): Promise<Launch> {
  const response = await fetch(`${apiBaseUrl}/api/v1/launches/${launchId}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to retrieve launch.");
  return response.json() as Promise<Launch>;
}
