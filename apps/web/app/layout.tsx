import type { Metadata } from "next";
import "@fontsource-variable/inter";
import Link from "next/link";
import { BrandMark } from "../components/brand";
import { DevelopmentBadge } from "../components/development-badge";
import { LocaleProvider } from "../components/locale-provider";
import { LanguageSelector } from "../components/language-selector";
import { ThemeScript, ThemeToggle } from "../components/theme-toggle";
import { dictionaries } from "../lib/i18n";
import { getLocale } from "../lib/locale-server";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { LinkPending } from "../components/pending-feedback";
import "./styles.css";
import "./dashboard.css";
import { SectionNavigation } from "../components/section-navigation";

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
  const d = dashboardCopy[locale];
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <ThemeScript />
        <LocaleProvider locale={locale}>
          <a className="skip-link" href="#main-content">{d.skip}</a>
          <div className="site-toolbar">
            <Link href="/" className="home-brand" aria-label="NextRocketLaunch home"><BrandMark /><LinkPending /></Link>
            <DevelopmentBadge />
            <SectionNavigation />
            <div className="toolbar-controls"><ThemeToggle /><LanguageSelector /></div>
          </div>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
