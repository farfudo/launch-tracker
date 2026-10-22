import type { Metadata } from "next";
import { LocaleProvider } from "../components/locale-provider";
import { LanguageSelector } from "../components/language-selector";
import { dictionaries } from "../lib/i18n";
import { getLocale } from "../lib/locale-server";
import "./styles.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = dictionaries[await getLocale()];
  return {
    title: `LaunchSkyline — ${t.pageTitle}`,
    applicationName: "LaunchSkyline",
    description: t.pageDescription
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>
        <LocaleProvider locale={locale}>
          <div className="site-toolbar"><LanguageSelector /></div>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
