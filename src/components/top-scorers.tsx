"use client";

import { useMemo, useState } from "react";
import { Flame, Medal, ChevronDown, ChevronUp } from "lucide-react";
import { WorldCupData, Match } from "@/lib/types";
import { getCountryFlagUrl } from "@/lib/data";

export function TopScorers({ data }: { data: WorldCupData }) {
  const [expanded, setExpanded] = useState(false);

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
    return Array.from(goalMap.values()).sort((a, b) => b.goals - a.goals).slice(0, 10);
  }, [data]);

  const displayedScorers = useMemo(() => (expanded ? scorers : scorers.slice(0, 5)), [scorers, expanded]);

  if (scorers.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 flex items-center justify-center"
            style={{ backgroundColor: "var(--secondary)", borderRadius: "10px" }}
          >
            <Flame className="h-4 w-4 animate-pulse" style={{ color: "#ff7a3d" /* gradient-orange */ }} />
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
            Golden Boot
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
          Leaderboard
        </span>
      </div>

      <div
        style={{
          backgroundColor: "var(--card)",
          borderRadius: "20px",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        <div className="flex flex-col" style={{ padding: "4px 8px" }}>
          <div style={{ borderTop: "1px solid transparent" }}>
            {displayedScorers.map((s, idx) => {
              const isTop3 = idx < 3;
              const medalColor = idx === 0 ? "#eab308" : idx === 1 ? "#94a3b8" : "#b45309";
              const flag = getCountryFlagUrl(s.team);
              return (
                <div
                  key={s.name}
                  className="flex items-center justify-between transition-colors duration-200 hover:bg-[var(--hover-bg)]"
                  style={{
                    padding: "10px 12px",
                    borderBottom: idx < displayedScorers.length - 1 ? "1px solid var(--hairline-soft)" : "none",
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
                            <span style={{ fontSize: "8px" }}>âš½</span>
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
                    <span style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>goals</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Show more/less */}
        {scorers.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1 py-2.5 transition-colors hover:bg-[var(--hover-bg)]"
            style={{
              borderTop: "1px solid #1a1a1a",
              color: "var(--muted-foreground)",
              fontSize: "13px",
              fontWeight: 500,
              letterSpacing: "-0.13px",
              background: "transparent",
              border: "none",
              borderTopWidth: "1px",
              borderTopStyle: "solid",
              borderTopColor: "var(--hairline-soft)",
              cursor: "pointer",
            }}
          >
            <span>{expanded ? "Show Less" : "Show More"}</span>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}