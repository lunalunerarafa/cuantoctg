import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import type { ReactNode } from "react";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter" });
const archivo = Archivo({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-archivo" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
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
        <div className="mx-auto min-h-screen w-full max-w-md bg-surface md:my-10 md:max-w-xl md:rounded-[10px] md:border md:border-ink">{children}</div>
        <Analytics />
      </body>
    </html>
  );
}
