import type { Launch } from "./api";

/** Topics connected to concrete Launch Library fields, never free-text keyword search. */
export const educationLaunchTopics = ["artemis", "starship", "reuse"] as const;
export type EducationLaunchTopic = typeof educationLaunchTopics[number];

const reusableVehicleNames = new Set([
  "falcon 9",
  "falcon 9 block 5",
  "falcon heavy",
  "new glenn",
  "starship",
  "starship / super heavy",
]);

// Only exact, editorially reviewed mission titles are associated with the Artemis guide.
const artemisMissionNames = new Set([
  "artemis i",
  "artemis ii",
  "artemis iii",
  "artemis iv",
  "artemis v",
  "artemis vi",
]);

const starshipVehicleNames = new Set(["starship", "starship / super heavy"]);

function normalizeEntity(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/\s*\/\s*/g, " / ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isLaunchRelatedToTopic(launch: Pick<Launch, "name" | "vehicle">, topic: EducationLaunchTopic): boolean {
  const missionName = normalizeEntity(launch.name);
  const vehicleName = normalizeEntity(launch.vehicle);

  switch (topic) {
    case "artemis":
      return artemisMissionNames.has(missionName);
    case "starship":
      return starshipVehicleNames.has(vehicleName);
    case "reuse":
      return reusableVehicleNames.has(vehicleName);
  }
}

export function relatedTopicsForLaunch(launch: Pick<Launch, "name" | "vehicle">): EducationLaunchTopic[] {
  return educationLaunchTopics.filter(topic => isLaunchRelatedToTopic(launch, topic));
}

/** Keeps API ordering (nearest upcoming first) and never duplicates a mission across topics. */
export function relatedLaunches(
  launches: Launch[],
  topics: readonly EducationLaunchTopic[],
  limit = topics.length,
): Array<{ launch: Launch; topics: EducationLaunchTopic[] }> {
  const matches = new Map<string, { launch: Launch; topics: EducationLaunchTopic[] }>();
  for (const topic of topics) {
    const launch = launches.find(item => isLaunchRelatedToTopic(item, topic));
    if (!launch) continue;
    const existing = matches.get(launch.id);
    if (existing) existing.topics.push(topic);
    else matches.set(launch.id, { launch, topics: [topic] });
  }
  return Array.from(matches.values()).slice(0, limit);
}
