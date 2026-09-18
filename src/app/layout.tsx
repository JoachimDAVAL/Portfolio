import type { Metadata } from "next";
import "./globals.css";



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
    <html lang="fr">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/ttq6oku.css" />
        <link rel="icon" href="/favicon.webp" type="image/webp" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
