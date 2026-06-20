"use client";

import Link from "next/link";
import { Trophy, ChevronRight } from "lucide-react";
import { GroupData } from "@/lib/types";
import { getCountryFlagUrl } from "@/lib/data";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useTranslation } from "../layout/language-provider";

export function GroupTable({
  group,
  qualifyingThirds = [],
}: {
  group: GroupData;
  qualifyingThirds?: string[];
}) {
  const { t } = useTranslation();
  const isId = t("home") === "Beranda";

  return (
    <div
      className="flex flex-col justify-between h-full"
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "20px", /* xl */
        overflow: "hidden",
        transition: "box-shadow 0.3s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid var(--hairline-soft)",
          backgroundColor: "var(--card-muted)",
          padding: "12px 16px",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4" style={{ color: "var(--foreground)" }} />
            <span
              style={{
                color: "var(--foreground)",
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "-0.14px",
              }}
            >
              {group.name}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: "12px 0" }}>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: "440px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500 }}>
                <th className="text-center pb-2" style={{ paddingLeft: "16px", paddingRight: "16px", width: "48px" }}>#</th>
                <th className="text-left pb-2 pr-2">{t("team")}</th>
                <th className="text-center pb-2 px-1" style={{ width: "32px" }}>{t("tableMp")}</th>
                <th className="text-center pb-2 px-1" style={{ width: "32px" }}>{t("tableW")}</th>
                <th className="text-center pb-2 px-1" style={{ width: "32px" }}>{t("tableD")}</th>
                <th className="text-center pb-2 px-1" style={{ width: "32px" }}>{t("tableL")}</th>
                <th className="text-center pb-2 px-1 hidden sm:table-cell" style={{ width: "32px" }}>{t("tableGf")}</th>
                <th className="text-center pb-2 px-1 hidden sm:table-cell" style={{ width: "32px" }}>{t("tableGa")}</th>
                <th className="text-center pb-2 px-1 hidden sm:table-cell" style={{ width: "32px" }}>{t("tableGd")}</th>
                <th className="text-center pb-2 px-1 md:pr-1 pr-4" style={{ width: "48px" }}>{t("tablePts")}</th>
                <th className="text-center pb-2 pl-1 pr-4 hidden md:table-cell" style={{ width: "115px" }}>{isId ? "Tren" : "Form"}</th>
              </tr>
            </thead>
            <tbody>
              {group.standings.map((team, idx) => {
                const isQualifying = idx < 2;
                const isThirdPlace = idx === 2 && qualifyingThirds.includes(team.team);
                const flag = getCountryFlagUrl(team.team);
                
                // Form rendering helper
                const last5 = team.form ? team.form.slice(-5) : [];
                const formSlots = [...last5];
                while (formSlots.length < 5) {
                  formSlots.unshift(null as any);
                }

                return (
                  <tr
                    key={team.team}
                    className="transition-colors hover:bg-[var(--hover-bg)]"
                    style={{
                      borderBottom: "1px solid var(--hairline-soft)",
                      backgroundColor: isQualifying
                        ? "rgba(34, 197, 94, 0.06)"
                        : idx === 2
                        ? "rgba(59, 130, 246, 0.06)"
                        : "transparent",
                    }}
                  >
                    <td className="py-2.5 text-center" style={{ paddingLeft: "16px", paddingRight: "16px", width: "48px" }}>
                      <span
                        className="inline-flex items-center justify-center w-5 h-5"
                        style={{
                          borderRadius: "6px",
                          fontSize: "10px",
                          fontWeight: 700,
                          backgroundColor: isQualifying || isThirdPlace
                            ? "var(--tint-border)"
                            : "var(--tint-bg)",
                          color: isQualifying || isThirdPlace
                            ? "var(--foreground)"
                            : "var(--muted-foreground)",
                        }}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-5 h-3.5 overflow-hidden shrink-0 flex items-center justify-center"
                          style={{ borderRadius: "3px", border: "1px solid var(--border)", backgroundColor: "var(--tint-bg)" }}
                        >
                          {flag ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={flag} alt={team.team} className="w-full h-full object-cover select-none" />
                          ) : (
                            <span style={{ fontSize: "10px" }}>🏆</span>
                          )}
                        </div>
                        <span
                          className="truncate block"
                          style={{ color: "var(--foreground)", fontSize: "13px", fontWeight: 700, letterSpacing: "-0.13px" }}
                        >
                          {team.team}
                        </span>
                      </div>
                    </td>
                    {[team.played, team.won, team.drawn, team.lost].map((val, i) => (
                      <td
                        key={i}
                        className="text-center py-2.5 px-1"
                        style={{
                          fontSize: "12px",
                          fontFeatureSettings: '"tnum"',
                          color: i === 0 ? "var(--muted-foreground)" : i === 1 ? "var(--foreground)" : "var(--muted-foreground)",
                          fontWeight: i === 1 ? 700 : 500,
                        }}
                      >
                        {val}
                      </td>
                    ))}
                    <td
                      className="text-center py-2.5 px-1 hidden sm:table-cell"
                      style={{ fontSize: "12px", fontWeight: 500, color: "var(--muted-foreground)", fontFeatureSettings: '"tnum"' }}
                    >
                      {team.goalsFor}
                    </td>
                    <td
                      className="text-center py-2.5 px-1 hidden sm:table-cell"
                      style={{ fontSize: "12px", fontWeight: 500, color: "var(--muted-foreground)", fontFeatureSettings: '"tnum"' }}
                    >
                      {team.goalsAgainst}
                    </td>
                    <td
                      className="text-center py-2.5 px-1 hidden sm:table-cell"
                      style={{ fontSize: "12px", fontWeight: 700, color: "var(--foreground)", fontFeatureSettings: '"tnum"' }}
                    >
                      {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                    </td>
                    <td
                      className="text-center py-2.5 px-1 md:pr-1 pr-4"
                      style={{ fontSize: "13px", fontWeight: 700, color: "var(--foreground)", fontFeatureSettings: '"tnum"' }}
                    >
                      {team.points}
                    </td>
                    <td className="py-2.5 px-1 pr-4 hidden md:table-cell">
                      <div className="flex items-center gap-1 justify-center">
                        {formSlots.map((res, sIdx) => {
                          if (!res) {
                            return (
                              <div
                                key={sIdx}
                                className="rounded-full flex items-center justify-center shrink-0"
                                style={{
                                  border: "1.5px solid var(--muted-foreground)",
                                  opacity: 0.6,
                                  width: "18px",
                                  height: "18px",
                                  backgroundColor: "transparent",
                                }}
                              />
                            );
                          }
                          const bg = res === "W" ? "#22c55e" : res === "L" ? "#ef4444" : "#94a3b8";
                           return (
                            <Tooltip key={sIdx}>
                              <TooltipTrigger asChild>
                                <div
                                  className="rounded-full flex items-center justify-center shrink-0"
                                  style={{
                                    backgroundColor: bg,
                                    width: "18px",
                                    height: "18px",
                                    cursor: "help"
                                  }}
                                >
                                  {res === "W" ? (
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  ) : res === "L" ? (
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  ) : (
                                    <div style={{ width: "6px", height: "2px", backgroundColor: "#ffffff", borderRadius: "1px" }} />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                {res === "W" ? (isId ? "Menang" : "Win") : res === "L" ? (isId ? "Kalah" : "Loss") : (isId ? "Seri" : "Draw")}
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {group.standings.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center" style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>
                    {isId ? "Belum ada laga yang dimainkan" : "No matches played yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid var(--hairline-soft)", backgroundColor: "var(--card-muted)" }}>
        <div className="flex flex-col gap-3">
          {group.standings.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5" style={{ fontSize: "10px", color: "var(--muted-foreground)", fontWeight: 500 }}>
                <div
                  style={{
                    height: "8px",
                    width: "8px",
                    borderRadius: "9999px",
                    backgroundColor: "#22c55e",
                    border: "1px solid rgba(34, 197, 94, 0.4)",
                  }}
                />
                <span>{isId ? "2 teratas lolos ke Babak 32 Besar" : "Top 2 qualify for Round of 32"}</span>
              </div>
              <div className="flex items-center gap-1.5" style={{ fontSize: "10px", color: "var(--muted-foreground)", fontWeight: 500 }}>
                <div
                  style={{
                    height: "8px",
                    width: "8px",
                    borderRadius: "9999px",
                    backgroundColor: "#3b82f6",
                    border: "1px solid rgba(59, 130, 246, 0.4)",
                  }}
                />
                <span>{isId ? "Posisi 3 masuk pemeringkatan peringkat 3 terbaik" : "3rd place enters best 3rd rankings"}</span>
              </div>
            </div>
          )}
          <Link
            href={`/standing/${encodeURIComponent(group.name)}`}
            className="btn-secondary inline-flex items-center justify-center gap-1.5 w-full"
            style={{ padding: "10px 12px", fontSize: "13px" }}
          >
            <span>{isId ? "Lihat Pertandingan Grup" : "View Group Matches"}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}