import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AcreList for Agriculture",
  description: "Professional price sheets, smart customer engagement, and AI support that puts your agricultural products in front of the buyers who matter most. Everything suppliers need to attract quality customers.",
  keywords: ["agriculture", "supplier tools", "price sheets", "AI chatbot", "agricultural business", "farming", "premium buyers", "sales"],
  authors: [{ name: "AcreList" }],
  openGraph: {
    title: "AcreList - Get Discovered by Premium Buyers",
    description: "Professional price sheets, smart customer engagement, and AI support that puts your agricultural products in front of the buyers who matter most. Everything suppliers need to attract quality customers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
