import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "../components/brand";
import { LocaleProvider } from "../components/locale-provider";
import { LanguageSelector } from "../components/language-selector";
import { ThemeScript, ThemeToggle } from "../components/theme-toggle";
import { dictionaries } from "../lib/i18n";
import { getLocale } from "../lib/locale-server";
import "./styles.css";
import "./dashboard.css";

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
          <a className="skip-link" href="#main-content">Skip to content</a>
          <div className="site-toolbar">
            <Link href="/" className="home-brand" aria-label="NextRocketLaunch home"><BrandMark /></Link>
            <nav className="primary-navigation" aria-label="Main navigation"><Link href="/#launch-calendar">Launches</Link><Link href="/#launch-calendar">Calendar</Link><Link href="/?favorites=1#launch-calendar">Favorites</Link></nav>
            <div className="toolbar-controls"><ThemeToggle /><LanguageSelector /></div>
          </div>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
