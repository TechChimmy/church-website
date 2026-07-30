import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import LoadingScreen from "@/components/ui/LoadingScreen";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700"],
  display: "swap",
});

const lato = Lato({
  subsets: ["latin"],
  variable: "--font-lato",
  weight: ["300", "400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Christian Fellowship Church",
  description: "Faith. Hope. Love. — Welcome to Christian Fellowship Church.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${lato.variable}`} data-scroll-behavior="smooth">
      <body style={{ backgroundColor: "var(--bg-light)" }}>
        <LanguageProvider>
          <LoadingScreen />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
