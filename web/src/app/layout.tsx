import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import MaintenanceWrapper from "@/components/MaintenanceWrapper";
import NetworkMonitor from "@/components/NetworkMonitor";
import { OnboardingWrapper } from "@/components/OnboardingModal";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
const inter = Inter({
  variable: "--font-inter",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${GeistSans.variable} antialiased selection:bg-primary selection:text-primary-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <NetworkMonitor />
            <MaintenanceWrapper>
            <OnboardingWrapper>
              {children}
            </OnboardingWrapper>
            <Toaster position="bottom-right" richColors />
          </MaintenanceWrapper>
        </AuthProvider>
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
