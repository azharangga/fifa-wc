import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { LanguageProvider } from "@/components/layout/language-provider";
import { MobileNavigation } from "@/components/layout/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScrollToTop } from "@/components/layout/scroll-to-top";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FIFA World Cup 2026",
  description:
    "Follow every match of the 2026 FIFA World Cup. Live scores, group standings, knockout brackets, and top scorers. 48 teams across USA, Mexico & Canada.",
  keywords: [
    "FIFA World Cup 2026",
    "World Cup",
    "live scores",
    "football",
    "soccer",
    "bracket",
    "groups",
    "standings",
  ],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "FIFA World Cup 2026",
    description:
      "Follow every match of the 2026 FIFA World Cup. Live scores, group standings, knockout brackets, and top scorers.",
    type: "website",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
        style={{ fontFamily: "var(--font-geist-sans), Inter, system-ui, sans-serif" }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <Header />

            {/* ─── Main Content ────────────────────────────────────────────────── */}
            <main className="flex-1 w-full pt-14 pb-20 md:pb-0">{children}</main>

            <Footer />

            <MobileNavigation />
            <ScrollToTop />
            <Toaster />
            <Analytics />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
