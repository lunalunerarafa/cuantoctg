import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import type { ReactNode } from "react";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter" });
const archivo = Archivo({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-archivo" });

export const metadata: Metadata = {
  metadataBase: new URL("https://cuantocuestacartagena.com"),
  title: {
    default: "Cuánto Cuesta un Taxi en Cartagena — Tarifas Reales",
    template: "%s | Cuánto Cuesta Cartagena",
  },
  description:
    "Cuánto cuesta un taxi en Cartagena, reportado por quienes pagaron. Tarifas reales entre barrios, sin adivinar.",
  alternates: {
    canonical: "https://cuantocuestacartagena.com",
    languages: { es: "/es", en: "/en", fr: "/fr" },
  },
  openGraph: {
    title: "Cuánto Cuesta un Taxi en Cartagena",
    description: "Tarifas reales de taxi en Cartagena, reportadas por viajeros.",
    url: "https://cuantocuestacartagena.com",
    siteName: "Cuánto Cuesta Cartagena",
    locale: "es_CO",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <html lang={lang}>
      <body className={`${inter.variable} ${archivo.variable} antialiased`}>
        <div className="mx-auto min-h-dvh w-full max-w-md md:flex md:min-h-dvh md:max-w-3xl md:items-center md:px-6 md:py-14">
          <div className="w-full">{children}</div>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
