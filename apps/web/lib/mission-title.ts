export function missionTitle(launch: { name: string; mission_name?: string | null }): string {
  const mission = launch.mission_name?.trim();
  return !mission || /^(unknown payload|unknown|tbd|to be determined)$/i.test(mission)
    ? launch.name : mission;
}
