import type { Metadata, Viewport } from "next";
import { Archivo, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { BottomTabs } from "@/components/ui/BottomTabs";
import "./globals.css";

// Variable font with the width axis, so headlines can use font-stretch for the condensed look.
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"] });
const instrument = Instrument_Sans({ variable: "--font-instrument", subsets: ["latin"], weight: ["400", "600"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "Wrenchly",
  description: "Learn your own car in 5 minutes a day. Stop overpaying for repairs.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${archivo.variable} ${instrument.variable} ${jetbrains.variable}`}>
      <body>
        {children}
        <BottomTabs />
      </body>
    </html>
  );
}
