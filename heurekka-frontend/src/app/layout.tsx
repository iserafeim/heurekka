import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Heurekka - Encuentra tu hogar ideal",
    template: "%s | Heurekka"
  },
  description: "La plataforma de alquiler de viviendas a largo plazo más confiable de Honduras. Encuentra apartamentos, casas y habitaciones en las mejores ubicaciones.",
  keywords: ["alquiler", "vivienda", "apartamentos", "casas", "Honduras", "Tegucigalpa", "San Pedro Sula"],
  authors: [{ name: "Heurekka Team" }],
  creator: "Heurekka",
  publisher: "Heurekka",
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: "/",
    languages: {
      "es-HN": "/es",
      "en-US": "/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_HN",
    alternateLocale: ["en_US"],
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: "Heurekka",
    title: "Heurekka - Encuentra tu hogar ideal",
    description: "La plataforma de alquiler de viviendas a largo plazo más confiable de Honduras.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Heurekka - Plataforma de alquiler de viviendas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Heurekka - Encuentra tu hogar ideal",
    description: "La plataforma de alquiler de viviendas a largo plazo más confiable de Honduras.",
    images: ["/twitter-image.jpg"],
    creator: "@heurekka",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
