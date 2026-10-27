import type { Launch } from "./api";

/** Match explicit mission/vehicle names only; never infer mission capability or status. */
export function relatedMission(launches: Launch[], topic: "artemis" | "starship" | "reusable"): Launch | undefined {
  return launches.find(launch => {
    const name = launch.name || "";
    const vehicle = launch.vehicle || "";
    if (topic === "artemis") return /\bartemis\b/i.test(name);
    if (topic === "starship") return /\bstarship\b/i.test(vehicle);
    return /\bfalcon\s*(?:9|heavy)\b/i.test(vehicle) || /\bnew\s+glenn\b/i.test(vehicle);
  });
}
