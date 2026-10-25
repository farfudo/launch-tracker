import { dictionaries, type Locale, type Messages } from "./i18n";

const statusKeys: Record<string, keyof Messages> = {
  Go: "statusGo",
  "Go for Launch": "statusGo",
  TBD: "statusTbd",
  "To Be Determined": "statusTbd",
  TBC: "statusTbc",
  "To Be Confirmed": "statusTbc",
  Hold: "statusHold",
  "Launch Successful": "statusSuccess",
  Success: "statusSuccess",
  "Launch Failure": "statusFailure",
  Failure: "statusFailure",
  "Launch was a Partial Failure": "statusPartialFailure",
  "Partial Failure": "statusPartialFailure",
  "Launch in Flight": "statusInFlight",
  "In Flight": "statusInFlight"
};

export function formatLaunchStatus(status: string, locale: Locale = "pt-PT"): string {
  const key = statusKeys[status];
  return key ? dictionaries[locale][key] : status;
}

export function launchStatusTone(status: string): string {
  const key = statusKeys[status];
  if (key === "statusGo" || key === "statusSuccess") return "positive";
  if (key === "statusTbc" || key === "statusTbd" || key === "statusHold") return "pending";
  if (key === "statusFailure" || key === "statusPartialFailure") return "negative";
  if (key === "statusInFlight") return "active";
  return "neutral";
}

export const statusFilters = {go:"statusGo", tbc:"statusTbc", tbd:"statusTbd", success:"statusSuccess", hold:"statusHold", failure:"statusFailure", partial:"statusPartialFailure", inflight:"statusInFlight"} as const;
export function uncertainLaunchDate(status?: string): boolean {
  return !!status && ["statusTbc", "statusTbd", "statusHold"].includes(statusKeys[status]);
}
