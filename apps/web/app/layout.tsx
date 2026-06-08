import type { Metadata } from "next";
import "./globals.css";
import Nav from "./Nav";

export const metadata: Metadata = {
  title: "MadLipz",
  description: "Voice-over the world — 80+ languages",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "var(--bg)" }}>
        <Nav />
        {children}
      </body>
    </html>
  );
}
