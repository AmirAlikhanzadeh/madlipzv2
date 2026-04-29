import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MadLipz",
  description: "MadLipz v2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
