import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Launch Tracker",
  description: "Acompanhe lançamentos espaciais em todo o mundo."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
