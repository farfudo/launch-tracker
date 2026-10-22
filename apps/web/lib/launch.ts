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
