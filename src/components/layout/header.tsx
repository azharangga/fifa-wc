"use client";

import Link from "next/link";
import Image from "next/image";
import { Navigation } from "./navigation";
import { ThemeToggle } from "./theme-toggle";
import { GlobalSearch } from "./global-search";
import { Languages } from "lucide-react";
import { useTranslation } from "./language-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function Header() {
  const { lang, setLang } = useTranslation();

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        backgroundColor: "var(--background)",
        borderBottomColor: "var(--border)",
        height: "56px",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr] gap-4">
        {/* Brand mark — monochrome */}
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
        >
          <Image
            src="/images/wc2026-logo.svg"
            alt="FIFA World Cup"
            width={24}
            height={34}
            className="h-7 w-auto select-none dark:hidden"
            priority
            suppressHydrationWarning
          />
          <Image
            src="/images/wc2026-logo-white.svg"
            alt="FIFA World Cup"
            width={24}
            height={34}
            className="h-7 w-auto select-none hidden dark:block"
            priority
            suppressHydrationWarning
          />
          <span
            className="text-xs sm:text-sm font-medium tracking-tight leading-none"
            style={{ color: "var(--foreground)", letterSpacing: "-0.14px" }}
            suppressHydrationWarning
          >
            FIFA World Cup 2026
          </span>
        </Link>

        {/* Centered navigation */}
        <Navigation />

        {/* Search & Theme toggle — right aligned */}
        <div className="justify-self-end flex items-center gap-2">
          <GlobalSearch />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 px-2.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--hover-bg)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center gap-1.5 transition-all cursor-pointer font-bold text-xs uppercase"
              >
                <Languages className="h-4 w-4" />
                <span>{lang.toUpperCase()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[var(--card)] border border-[var(--border)] min-w-[130px] p-1">
              <DropdownMenuItem
                onClick={() => setLang("en")}
                className="flex items-center justify-between text-xs px-2.5 py-1.5 cursor-pointer rounded-md transition-all focus:bg-[var(--foreground)] focus:text-[var(--background)]"
                style={{
                  backgroundColor: lang === "en" ? "var(--foreground)" : "transparent",
                  color: lang === "en" ? "var(--background)" : "var(--muted-foreground)",
                  fontWeight: lang === "en" ? 700 : 500,
                }}
              >
                <span>English</span>
                <span 
                  className="text-[9px] px-1 rounded border font-extrabold select-none"
                  style={{
                    borderColor: lang === "en" ? "currentColor" : "var(--border)",
                    opacity: lang === "en" ? 0.8 : 0.6,
                  }}
                >
                  EN
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setLang("id")}
                className="flex items-center justify-between text-xs px-2.5 py-1.5 cursor-pointer rounded-md transition-all focus:bg-[var(--foreground)] focus:text-[var(--background)]"
                style={{
                  backgroundColor: lang === "id" ? "var(--foreground)" : "transparent",
                  color: lang === "id" ? "var(--background)" : "var(--muted-foreground)",
                  fontWeight: lang === "id" ? 700 : 500,
                }}
              >
                <span>Indonesia</span>
                <span 
                  className="text-[9px] px-1 rounded border font-extrabold select-none"
                  style={{
                    borderColor: lang === "id" ? "currentColor" : "var(--border)",
                    opacity: lang === "id" ? 0.8 : 0.6,
                  }}
                >
                  ID
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
