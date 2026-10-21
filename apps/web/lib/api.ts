export type Launch = {
  id: string;
  name: string;
  status: string;
  net: string;
  agency: string | null;
  vehicle: string | null;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

export async function getUpcomingLaunches(limit = 6): Promise<Launch[]> {
  const response = await fetch(`${apiBaseUrl}/api/v1/launches?limit=${limit}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Unable to retrieve launch data.");
  }

  return response.json() as Promise<Launch[]>;
}
