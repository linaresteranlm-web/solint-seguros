import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SOLINT SEGUROS",
  description:
    "Sistema inteligente para la gestión de SCTR y Vida Ley desarrollado por SOLINT Business Systems.",
  applicationName: "SOLINT SEGUROS",
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
    title: "SOLINT SEGUROS",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "SOLINT SEGUROS",
    description:
      "Sistema inteligente para la gestión de SCTR y Vida Ley.",
    siteName: "SOLINT SEGUROS",
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
