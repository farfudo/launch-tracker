import { getLaunch } from "../../../../lib/api";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-zA-Z0-9-]{1,128}$/.test(id)) return Response.json({ error: "Invalid mission identifier" }, { status: 400 });
  try {
    return Response.json(await getLaunch(id), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Mission temporarily unavailable" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
