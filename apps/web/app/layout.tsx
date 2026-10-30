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
import { ScrollHeader } from "../components/scroll-header";
import { SiteFooter } from "../components/site-footer";
import { FeedbackWidget, FeedbackLink } from "../components/feedback-widget";
import "./feedback.css";
import "./admin.css";
import { PageBackground } from "../components/page-background";

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
          <PageBackground/>
          <a className="skip-link" href="#main-content">{d.skip}</a>
          <ScrollHeader>
            <Link href="/" className="home-brand" aria-label="NextRocketLaunch home"><BrandMark /><LinkPending /></Link>
            <div className="development-feedback"><div className="development-projects"><DevelopmentBadge /><a className="project-status-badge other-projects-badge" href="#other-projects"><span aria-hidden="true">●</span> {dictionaries[locale].otherProjects}</a></div><FeedbackLink placement="header"/></div>
            <SectionNavigation />
            <div className="toolbar-controls"><ThemeToggle /><LanguageSelector /></div>
          </ScrollHeader>
          {children}
          <SiteFooter locale={locale}/>
          <FeedbackWidget controller={process.env.FEEDBACK_CONTROLLER} contact={process.env.FEEDBACK_PRIVACY_CONTACT}/>
        </LocaleProvider>
      </body>
    </html>
  );
}
