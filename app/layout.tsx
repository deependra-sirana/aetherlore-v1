import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Secure AI Game Narrative Generator | Enterprise LLM Shielded",
  description:
    "Production-grade Game Lore and Character Narrative Generator powered by Next.js 14, featuring prompt injection shielding, XSS mitigation, rate-limiting, and zero-config Vercel deployment.",
  keywords: [
    "AI Game Lore",
    "Narrative Generator",
    "Prompt Injection Shield",
    "Next.js 14",
    "DevSecOps",
    "RPG Character Creator",
    "Cyberpunk",
    "Dark Fantasy",
  ],
  authors: [{ name: "DevSecOps Engineering Team" }],
  openGraph: {
    title: "Secure AI Game Narrative Generator",
    description: "Battle-tested LLM Narrative Engine with multi-tier cybersecurity defenses.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#030712",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="bg-background text-gray-100 min-h-screen flex flex-col antialiased selection:bg-purple-500/30 selection:text-cyan-300">
        <div className="fixed inset-0 bg-cyber-grid bg-[size:32px_32px] pointer-events-none opacity-40 z-0" />
        <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none z-0" />
        <div className="fixed top-1/2 right-0 w-[500px] h-[500px] bg-cyan-600/10 blur-[160px] rounded-full pointer-events-none z-0" />
        
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
