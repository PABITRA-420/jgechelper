import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import MaintenanceWrapper from "@/components/MaintenanceWrapper";
import NetworkMonitor from "@/components/NetworkMonitor";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://jgechelper.vercel.app'),
  title: "JGECHelper - Your Academic Companion",
  description: "The ultimate resource hub for JGEC students.",
  openGraph: {
    title: "JGECHelper - Your Academic Companion",
    description: "The ultimate resource hub for JGEC students.",
    url: "https://jgechelper.vercel.app", // Fallback, normally absolute URL
    siteName: "JGECHelper",
    images: [
      {
        url: "/icon.png", // Next.js standard public icon fallback
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JGECHelper - Your Academic Companion",
    description: "The ultimate resource hub for JGEC students.",
    images: ["/icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased selection:bg-primary selection:text-primary-foreground`}>
        <AuthProvider>
          <NetworkMonitor />
          <MaintenanceWrapper>
            {children}
          </MaintenanceWrapper>
        </AuthProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
