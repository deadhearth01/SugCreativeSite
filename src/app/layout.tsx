import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import HapticsProvider from "@/components/HapticsProvider";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-inter", // keeping variable name for css compatibility
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sug Creative | Simplify Operations, Maximize Results",
  description:
    "Empowering businesses, startups, and careers with innovative solutions. Business consulting, career guidance, startup incubation, and educational technology.",
  keywords: [
    "business solutions",
    "career guidance",
    "startup hub",
    "edu tech",
    "consulting",
    "sug creative",
  ],
  openGraph: {
    title: "Sug Creative | Business Solutions & Career Guidance",
    description:
      "Empowering businesses, startups, and careers with innovative solutions.",
    type: "website",
    url: "https://sugcreative.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable}`}>
      <body className="font-body antialiased" suppressHydrationWarning>
        <HapticsProvider />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
