import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AOSInit from "@/components/AOSInit";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import ClientLayoutContent from "@/components/ClientLayoutContent";

// Font configurations
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Serena Green",
  description: "Sustainability Platform for Serena Hotels - Tracking environmental initiatives across plantations, solar energy, and waste management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* OpenLayers will handle its own CSS imports */}
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <AOSInit />
          <Navbar />

          <ClientLayoutContent>
            {children}
          </ClientLayoutContent>
        </Providers>
      </body>
    </html>
  );
}