import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SOLINT Business Suite",
  description:
    "Plataforma empresarial de gestión, analítica e inteligencia ejecutiva desarrollada por SOLINT Business Systems.",
  applicationName: "SOLINT Business Suite",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
      },
      {
        url: "/images/solint-business-systems-c.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.ico",
    apple: "/images/solint-business-systems-c.png",
  },
  appleWebApp: {
    capable: true,
    title: "SOLINT Business Suite",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "SOLINT Business Suite",
    description:
      "Plataforma empresarial de gestión, analítica e inteligencia ejecutiva.",
    siteName: "SOLINT Business Suite",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#005eb8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
