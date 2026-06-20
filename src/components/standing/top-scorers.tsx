"use client";

import { useMemo, useState } from "react";
import { Flame, Medal, ChevronDown, ChevronUp } from "lucide-react";
import { WorldCupData, Match } from "@/lib/types";
import { getCountryFlagUrl } from "@/lib/data";
import { useTranslation } from "../layout/language-provider";

export function TopScorers({ data }: { data: WorldCupData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  const isId = t("home") === "Beranda";

  const scorers = useMemo(() => {
    const goalMap = new Map<string, { name: string; goals: number; team: string }>();
    for (const match of data.matches) {
      if (!match.score?.ft) continue;
      const processGoals = (goals: Match["goals1"], teamSide: string) => {
        if (!goals) return;
        for (const g of goals) {
          if (g.owngoal) continue;
          const key = `${g.name}-${teamSide}`;
          if (!goalMap.has(key)) goalMap.set(key, { name: g.name, goals: 0, team: teamSide });
          goalMap.get(key)!.goals++;
        }
      };
      processGoals(match.goals1, match.team1);
      processGoals(match.goals2, match.team2);
    }
    return Array.from(goalMap.values()).sort((a, b) => b.goals - a.goals);
  }, [data]);

  const top5Scorers = useMemo(() => scorers.slice(0, 5), [scorers]);

  if (scorers.length === 0) return null;

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 flex items-center justify-center"
            style={{ backgroundColor: "var(--card)", borderRadius: "10px", border: "1px solid var(--border)" }}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--foreground)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 16v-2a4 4 0 0 1 4-4h3l3 3h4a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
              <path d="M14 10V8a2 2 0 0 0-2-2H8" />
              <path d="M6 20h2M12 20h2M18 20h2" />
            </svg>
          </div>
          <h2
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 500,
              lineHeight: 1.13,
              letterSpacing: "-1px",
              color: "var(--foreground)",
            }}
          >
            {isId ? "Pencetak Gol" : "Top Scorers"}
          </h2>
        </div>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "6px",
            backgroundColor: "var(--card)",
            color: "var(--muted-foreground)",
            border: "1px solid var(--border)",
          }}
        >
          {isId ? "Papan Skor" : "Leaderboard"}
        </span>
      </div>

      <div
        className="flex flex-col justify-between flex-grow"
        style={{
          backgroundColor: "var(--card)",
          borderRadius: "20px",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <div className="flex flex-col flex-grow" style={{ padding: "4px 8px" }}>
          <div style={{ borderTop: "1px solid transparent" }}>
            {top5Scorers.map((s, idx) => {
              const isTop3 = idx < 3;
              const medalColor = idx === 0 ? "#eab308" : idx === 1 ? "#94a3b8" : "#b45309";
              const flag = getCountryFlagUrl(s.team);
              return (
                <div
                  key={s.name}
                  className="flex items-center justify-between transition-colors duration-200 hover:bg-[var(--hover-bg)]"
                  style={{
                    padding: "10px 12px",
                    borderBottom: idx < top5Scorers.length - 1 ? "1px solid var(--hairline-soft)" : "none",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 h-5 flex items-center justify-center shrink-0">
                      {isTop3 ? (
                        <Medal className="h-4 w-4" style={{ color: medalColor }} />
                      ) : (
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted-foreground)" }}>{idx + 1}</span>
                      )}
                    </span>
                    <div className="min-w-0">
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.14px" }} className="truncate">
                        {s.name}
                      </p>
                      <p className="flex items-center gap-1.5 mt-0.5" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                        <span
                          className="shrink-0 inline-block overflow-hidden"
                          style={{ width: "18px", height: "12px", borderRadius: "2px", border: "1px solid var(--border)", backgroundColor: "var(--tint-bg)" }}
                        >
                          {flag ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={flag} alt={s.team} className="w-full h-full object-cover select-none" />
                          ) : (
                            <svg className="w-2.5 h-2.5 text-[var(--muted-foreground)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                              <path d="M2 12h20" />
                            </svg>
                          )}
                        </span>
                        <span>{s.team}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--foreground)", fontFeatureSettings: '"tnum"' }}>
                      {s.goals}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{isId ? "gol" : "goals"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Underlined Show More button */}
        {scorers.length > 5 && (
          <div
            className="flex items-center justify-center"
            style={{
              padding: "12px 8px",
              borderTop: "1px solid var(--hairline-soft)",
            }}
          >
            <button
              onClick={() => setIsModalOpen(true)}
              className="underline"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--muted-foreground)",
                fontSize: "13px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {isId ? "Lihat Lebih Banyak" : "Show More"}
            </button>
          </div>
        )}
      </div>

      {/* Modern Leaderboard Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          {/* Modal container */}
          <div
            className="relative w-full max-w-md flex flex-col max-h-[80vh] overflow-hidden"
            style={{
              backgroundColor: "var(--card)",
              borderRadius: "20px",
              border: "1px solid var(--border)",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between"
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--hairline-soft)",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--foreground)" }}>{isId ? "Papan Peringkat Pencetak Gol" : "Top Scorers Leaderboard"}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="hover:bg-[var(--hover-bg)] transition-colors"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--foreground)",
                  fontSize: "16px",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* List scroll area */}
            <div className="overflow-y-auto" style={{ padding: "8px" }}>
              {scorers.map((s, idx) => {
                const isTop3 = idx < 3;
                const medalColor = idx === 0 ? "#eab308" : idx === 1 ? "#94a3b8" : "#b45309";
                const flag = getCountryFlagUrl(s.team);
                return (
                  <div
                    key={s.name}
                    className="flex items-center justify-between transition-colors hover:bg-[var(--hover-bg)]"
                    style={{
                      padding: "10px 12px",
                      borderBottom: idx < scorers.length - 1 ? "1px solid var(--hairline-soft)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 h-5 flex items-center justify-center shrink-0">
                        {isTop3 ? (
                          <Medal className="h-4 w-4" style={{ color: medalColor }} />
                        ) : (
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted-foreground)" }}>{idx + 1}</span>
                        )}
                      </span>
                      <div className="min-w-0">
                        <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--foreground)" }} className="truncate">
                          {s.name}
                        </p>
                        <p className="flex items-center gap-1.5 mt-0.5" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                          <span
                            className="shrink-0 inline-block overflow-hidden"
                            style={{ width: "18px", height: "12px", borderRadius: "2px", border: "1px solid var(--border)", backgroundColor: "var(--tint-bg)" }}
                          >
                            {flag ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={flag} alt={s.team} className="w-full h-full object-cover select-none" />
                            ) : (
                              <svg className="w-2.5 h-2.5 text-[var(--muted-foreground)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                <path d="M2 12h20" />
                              </svg>
                            )}
                          </span>
                          <span>{s.team}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2">
                      <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--foreground)", fontFeatureSettings: '"tnum"' }}>
                        {s.goals}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>{isId ? "gol" : "goals"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
