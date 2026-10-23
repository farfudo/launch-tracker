"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { languageNames, locales } from "../lib/i18n";
import { useLocale } from "./locale-provider";

export function LanguageSelector() {
  const { locale, messages: t } = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [hasError, setHasError] = useState(false);

  return (
    <div className="language-control">
      <label htmlFor="site-language">{t.language}</label>
      <span className="language-short" aria-hidden="true">{locale.slice(0, 2).toUpperCase()}⌄</span>
      <select
        id="site-language"
        name="language"
        title={languageNames[locale]}
        value={locale}
        disabled={pending}
        aria-busy={pending}
        onChange={(event) => {
          const nextLocale = event.target.value;
          setHasError(false);
          startTransition(async () => {
            try {
              const response = await fetch("/preferences/language", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ locale: nextLocale })
              });
              if (!response.ok) throw new Error("Language preference failed");
              router.refresh();
            } catch {
              setHasError(true);
            }
          });
        }}
      >
        {locales.map((language) => <option key={language} value={language}>{languageNames[language]}</option>)}
      </select>
      {hasError ? <p role="alert">{t.languageError}</p> : null}
    </div>
  );
}
