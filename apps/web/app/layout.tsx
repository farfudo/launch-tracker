import type { Metadata } from "next";
import { LocaleProvider } from "../components/locale-provider";
import { LanguageSelector } from "../components/language-selector";
import { ThemeScript, ThemeToggle } from "../components/theme-toggle";
import { dictionaries } from "../lib/i18n";
import { getLocale } from "../lib/locale-server";
import "./styles.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = dictionaries[await getLocale()];
  return {
    title: `NextRocketLaunch — ${t.pageTitle}`,
    applicationName: "NextRocketLaunch",
    description: t.pageDescription
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <ThemeScript />
        <LocaleProvider locale={locale}>
          <div className="site-toolbar"><ThemeToggle /><LanguageSelector /></div>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
