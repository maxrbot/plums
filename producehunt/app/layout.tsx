import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProduceHunt - Source produce as fast as you can type",
  description: "Sourcing superpowers for CPG and Retail procurement teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
