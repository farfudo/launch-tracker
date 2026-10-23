"use client";

import { useLocale } from "./locale-provider";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Spinner } from "./pending-feedback";

export function RetryButton() {
  const { messages: t } = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button type="button" disabled={pending} aria-busy={pending} onClick={() => startTransition(() => router.refresh())}>{pending ? <Spinner /> : null}{t.retry}</button>;
}
