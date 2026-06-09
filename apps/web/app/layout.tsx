import type { Metadata } from "next";
import { Syne, Inter } from "next/font/google";
import "./globals.css";
import Nav from "./Nav";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap", weight: ["400","600","700","800"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "MadLipz — Voice the world",
  description: "Dub and remix videos in 80+ languages",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${inter.variable}`}>
      <body style={{ background: "var(--bg)" }}>
        <Nav />
        {children}
      </body>
    </html>
  );
}
