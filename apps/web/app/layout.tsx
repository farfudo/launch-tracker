import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "LaunchSkyline — Acompanhamento de lançamentos espaciais",
  applicationName: "LaunchSkyline",
  description: "Calendário global de lançamentos espaciais. Acompanhe missões, agências, foguetões e datas previstas com o LaunchSkyline."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
