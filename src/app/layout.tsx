import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Plums.ag - From Price Sheet to Sale",
  description: "Create better price sheets, track engagement with smart analytics, and provide instant customer support with AI. Everything agricultural suppliers need to grow their business.",
  keywords: ["agriculture", "supplier tools", "price sheets", "AI chatbot", "agricultural business", "farming", "produce"],
  authors: [{ name: "Plums.ag" }],
  openGraph: {
    title: "Plums.ag - From Price Sheet to Sale",
    description: "Create better price sheets, track engagement with smart analytics, and provide instant customer support with AI. Everything agricultural suppliers need to grow their business.",
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
      </body>
    </html>
  );
}
