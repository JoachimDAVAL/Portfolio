import type { Metadata } from "next";
import "./globals.css";
import { INTRO_SCRIPT } from "@/lib/intro";
import FaviconBlink from "@/components/FaviconBlink";

export const metadata: Metadata = {
  title: "Joachim Daval — Portfolio",
  description: "Portfolio de Joachim Daval, développeur fullstack & webmaster.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Décide avant le premier affichage si l'entrée (Preloader) est jouée : voir src/lib/intro.ts */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://use.typekit.net/ttq6oku.css" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <FaviconBlink />
        {children}
      </body>
    </html>
  );
}