import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taksa Dana - AI-Powered Property Valuation & Strategic Asset Intelligence",
  description: "Advanced AI-driven property valuation platform for banks, credit institutions, and developers in Indonesia. Integrates Jakarta Satu and Sentuh Tanahku data for accurate land assessment.",
  keywords: ["Taksa Dana", "Property Valuation", "Real Estate AI", "Jakarta Satu", "Sentuh Tanahku", "Land Assessment", "Indonesia Real Estate"],
  authors: [{ name: "Taksa Dana Team" }],
  openGraph: {
    title: "Taksa Dana - AI Property Valuation",
    description: "AI-powered property valuation and strategic asset intelligence for Indonesian real estate",
    url: "https://taksadana.ai",
    siteName: "Taksa Dana",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Taksa Dana - AI Property Valuation",
    description: "AI-powered property valuation and strategic asset intelligence for Indonesian real estate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
