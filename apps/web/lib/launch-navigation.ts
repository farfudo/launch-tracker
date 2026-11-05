export function launchDetailsHref(id: string, returnTo?: string) {
  const path = `/launches/${encodeURIComponent(id)}`;
  return returnTo ? `${path}?${new URLSearchParams({ returnTo })}` : path;
}

export function launchReturnHref(returnTo: string | string[] | null | undefined) {
  if (typeof returnTo !== "string" || !returnTo.startsWith("/?")) return "/";
  const url = new URL(returnTo, "https://calendar.invalid");
  const filters = new URLSearchParams();
  for (const name of ["period", "q", "agency", "vehicle", "status", "favorites"]) {
    const value = url.searchParams.get(name);
    if (value) filters.set(name, value);
  }
  return filters.size ? `/?${filters}#launch-calendar` : "/";
}
