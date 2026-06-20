"use client";

import Link from "next/link";
import { CircleDot, Github, Linkedin, Instagram, Mail } from "lucide-react";
import { useTranslation } from "./language-provider";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer
      style={{
        backgroundColor: "var(--background)",
        borderTopColor: "var(--hairline-soft)",
        paddingTop: "64px",
        paddingBottom: "32px",
        paddingLeft: "32px",
        paddingRight: "32px",
      }}
      className="border-t"
    >
      <div className="max-w-7xl mx-auto">
        {/* Footer link grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/wc2026-logo.svg"
                alt="FIFA World Cup"
                className="h-7 w-auto select-none dark:hidden"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/wc2026-logo-white.svg"
                alt="FIFA World Cup"
                className="h-7 w-auto select-none hidden dark:block"
              />
              <span
                className="font-medium tracking-tight"
                style={{ color: "var(--foreground)", fontSize: "15px", letterSpacing: "-0.15px" }}
              >
                FIFA World Cup 2026
              </span>
            </div>
            <p
              style={{ color: "var(--muted-foreground)", fontSize: "13px", lineHeight: "1.6", letterSpacing: "-0.13px" }}
            >
              {t("footerDesc")}
            </p>
            
            {/* Social Media Links */}
            <div className="flex items-center gap-2.5 pt-1.5">
              <a
                href="https://github.com/azharangga"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-85 transition-opacity"
                style={{
                  backgroundColor: "var(--foreground)",
                  color: "var(--background)",
                  borderRadius: "9999px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                }}
                aria-label="GitHub"
              >
                <Github className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://linkedin.com/azharanggakusuma"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-85 transition-opacity"
                style={{
                  backgroundColor: "var(--foreground)",
                  color: "var(--background)",
                  borderRadius: "9999px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                }}
                aria-label="LinkedIn"
              >
                <Linkedin className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://instagram.com/azharangga_kusuma"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-85 transition-opacity"
                style={{
                  backgroundColor: "var(--foreground)",
                  color: "var(--background)",
                  borderRadius: "9999px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                }}
                aria-label="Instagram"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
              <a
                href="mailto:azharanggakusuma01@gmail.com"
                className="hover:opacity-85 transition-opacity"
                style={{
                  backgroundColor: "var(--foreground)",
                  color: "var(--background)",
                  borderRadius: "9999px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                }}
                aria-label="Email"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Column 2: Empty Spacer to maintain column positions */}
          <div className="hidden md:block" />

          {/* Column 3: Explore */}
          <div className="space-y-3">
            <h4
              style={{ color: "var(--muted-foreground)", fontSize: "13px", fontWeight: 500, letterSpacing: "-0.13px", textTransform: "uppercase" }}
            >
              {t("home") === "Beranda" ? "Jelajahi" : "Explore"}
            </h4>
            <ul className="space-y-1.5">
              {[
                { label: t("home"), href: "/" },
                { label: t("standing"), href: "/standing" },
                { label: t("schedule"), href: "/schedule" },
                { label: t("teams"), href: "/teams" },
                { label: t("knockout"), href: "/knockout" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="hover:text-white transition-colors"
                    style={{ color: "var(--muted-foreground)", fontSize: "13px", fontWeight: 500, letterSpacing: "-0.13px" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="space-y-3">
            <h4
              style={{ color: "var(--muted-foreground)", fontSize: "13px", fontWeight: 500, letterSpacing: "-0.13px", textTransform: "uppercase" }}
            >
              {t("home") === "Beranda" ? "Info & Hukum" : "Legal & Info"}
            </h4>
            <ul className="space-y-1.5">
              {[(t("home") === "Beranda" ? "Penyangkalan" : "Disclaimer"), "Privacy Policy", "Terms of Service", (t("home") === "Beranda" ? "Pusat Bantuan" : "Help Center")].map((item) => (
                <li key={item}>
                  <span
                    className="hover:text-white transition-colors cursor-default"
                    style={{ color: "var(--muted-foreground)", fontSize: "13px", fontWeight: 500, letterSpacing: "-0.13px" }}
                  >
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTopColor: "var(--hairline-soft)", borderTopWidth: "1px" }}
        >
          <div
            className="flex items-center gap-1.5"
            style={{ color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 400, letterSpacing: "-0.12px" }}
          >
            <span>{t("footerCopyright")}</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Data & stream credit */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5"
              style={{
                color: "var(--muted-foreground)",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "-0.12px",
                backgroundColor: "var(--card)",
                borderRadius: "100px",
                border: "1px solid var(--border)",
              }}
            >
              <span>{t("footerCredits")}</span>
            </div>
            {/* Host nations */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5"
              style={{
                color: "var(--muted-foreground)",
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "-0.12px",
                backgroundColor: "var(--card)",
                borderRadius: "100px",
                border: "1px solid var(--border)",
              }}
            >
              <span>{t("home") === "Beranda" ? "Tuan Rumah:" : "Hosts:"}</span>
              <span className="flex gap-1 items-center select-none ml-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://flagcdn.com/us.svg" alt="USA" className="w-4 h-2.5 object-cover rounded-sm border border-white/10" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://flagcdn.com/mx.svg" alt="Mexico" className="w-4 h-2.5 object-cover rounded-sm border border-white/10" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://flagcdn.com/ca.svg" alt="Canada" className="w-4 h-2.5 object-cover rounded-sm border border-white/10" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
