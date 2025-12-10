import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Infinity Soul AIS v1.2",
  description: "AI Insurance System - Comprehensive Risk Assessment Platform for AI Systems",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
