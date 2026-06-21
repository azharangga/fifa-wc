"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Trophy, Calendar, Home, Users } from "lucide-react";
import { useTranslation } from "./language-provider";

const links = [
  { href: "/", labelKey: "home" as const, icon: Home },
  { href: "/standing", labelKey: "standing" as const, icon: LayoutGrid },
  { href: "/schedule", labelKey: "schedule" as const, icon: Calendar },
  { href: "/teams", labelKey: "teams" as const, icon: Users },
  { href: "/knockout", labelKey: "knockout" as const, icon: Trophy },
];

export function Navigation() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav
      className="hidden md:flex items-center gap-1 p-1"
      style={{
        backgroundColor: "var(--card)",
        borderRadius: "100px",
        border: "1px solid var(--border)",
      }}
    >
      {links.map((link) => {
        const Icon = link.icon;
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : link.href === "/schedule"
            ? pathname.startsWith("/schedule") || pathname.startsWith("/match")
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 transition-all duration-200"
            style={{
              borderRadius: "100px",
              fontSize: "14px",
              fontWeight: 500,
              letterSpacing: "-0.14px",
              lineHeight: 1.0,
              fontFeatureSettings: '"cv11"',
              backgroundColor: isActive ? "var(--primary)" : "transparent",
              color: isActive ? "var(--primary-foreground)" : "var(--muted-foreground)",
              boxShadow: "none",
            }}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{t(link.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNavigation() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
      style={{
        backgroundColor: "var(--background)",
        borderTop: "1px solid var(--border)",
        backdropFilter: "blur(16px)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
        paddingBottom: "max(8px, env(safe-area-inset-bottom))",
      }}
    >
      {links.map((link) => {
        const Icon = link.icon;
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : link.href === "/schedule"
            ? pathname.startsWith("/schedule") || pathname.startsWith("/match")
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center justify-center gap-1 flex-1 py-1 text-center transition-all"
            style={{
              color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
              fontWeight: isActive ? 600 : 500,
              fontSize: "9px",
              letterSpacing: "-0.12px",
            }}
          >
            <Icon className="h-4.5 w-4.5" />
            <span className="font-semibold tracking-tight">{t(link.labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
