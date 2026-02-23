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
  title: "JGECHelper - Your Academic Companion",
  description: "The ultimate resource hub for JGEC students.",
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
