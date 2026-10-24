import { LaunchNotFoundError } from "../../../../lib/api";
import { getCachedLaunch } from "../../../../lib/cached-api";
export const maxDuration = 60;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-zA-Z0-9-]{1,128}$/.test(id)) return Response.json({ error: "Invalid mission identifier" }, { status: 400 });
  try {
    const result = await getCachedLaunch(id);
    return Response.json({ ...result.value, frontend_cache: result.cache }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof LaunchNotFoundError) return Response.json({ error: "Mission not found" }, { status: 404, headers: { "Cache-Control": "no-store" } });
    return Response.json({ error: "Mission temporarily unavailable" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
