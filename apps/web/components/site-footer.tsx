import type { Locale } from "../lib/i18n";
import { dictionaries } from "../lib/i18n";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { FeedbackLink } from "./feedback-widget";
import { BackgroundCredit } from './page-background';
import { InfoDisclosure } from "./info-disclosure";

export function SiteFooter({locale}:{locale:Locale}) {
  const t = dictionaries[locale];
  return <footer className="site-footer">
    <p>NextRocketLaunch · {dashboardCopy[locale].tagline}</p>
    <p>{t.developedBy} <a href="https://github.com/farfudo" target="_blank" rel="noopener noreferrer">farfudo ↗</a> · <a href="https://github.com/farfudo/launch-tracker" target="_blank" rel="noopener noreferrer">{t.sourceCode} ↗</a></p>
    <p id="other-projects" className="footer-other-projects" tabIndex={-1}><span className="project-status-badge other-projects-badge"><span aria-hidden="true">●</span> {t.otherProjects}</span> <span className="footer-project-link"><a href="https://ride-together-app.vercel.app/" target="_blank" rel="noopener noreferrer">Ride Together — {t.rideTogetherDescription} ↗</a><InfoDisclosure label={t.rideTogetherAbout}>{t.rideTogetherIntro}</InfoDisclosure></span></p>
    <p><FeedbackLink/></p>
    <p className="footer-image-credit"><BackgroundCredit locale={locale}/></p>
  </footer>;
}
