import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Cinzel, Cormorant_Garamond, Outfit, UnifrakturMaguntia } from "next/font/google";
import "./globals.css";

const sans = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const mark = Cinzel({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-mark",
});

const display = UnifrakturMaguntia({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Tushar Hossen — Implesia IT",
  description:
    "Tushar Hossen, founder of Implesia IT in Dhaka. A cinematic portfolio. The storm is drawn and heard in the browser.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mark.variable} ${display.variable} gated`}>
      <body>
        {children}
      </body>
    </html>
  );
}
