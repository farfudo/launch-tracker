export type LaunchStatus = "Go" | "TBD" | "TBC" | "Hold";

const statusLabels: Record<LaunchStatus, string> = {
  Go: "Confirmado",
  TBD: "Data por definir",
  TBC: "A confirmar",
  Hold: "Em espera"
};

export function formatLaunchStatus(status: string): string {
  return statusLabels[status as LaunchStatus] ?? status;
}
