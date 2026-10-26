import type { Locale } from "../lib/i18n";
import { dictionaries } from "../lib/i18n";
import { dashboardCopy } from "../lib/dashboard-i18n";
import { BackgroundCredit } from './page-background';

export function SiteFooter({locale}:{locale:Locale}) {
  const t = dictionaries[locale];
  return <footer className="site-footer">
    <p>NextRocketLaunch · {dashboardCopy[locale].tagline}</p>
    <p>{t.developedBy} <a href="https://github.com/farfudo" target="_blank" rel="noopener noreferrer">farfudo ↗</a> · <a href="https://github.com/farfudo/launch-tracker" target="_blank" rel="noopener noreferrer">{t.sourceCode} ↗</a><BackgroundCredit locale={locale}/></p>
  </footer>;
}
