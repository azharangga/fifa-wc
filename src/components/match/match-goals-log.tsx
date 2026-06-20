"use client";

import { CircleDot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Match } from "@/lib/types";
import { getCountryFlagUrl } from "@/lib/data";
import { useTranslation } from "@/components/layout/language-provider";

interface MatchGoalsLogProps {
  match: Match;
}

export function SoccerBallIcon({ className = "h-3.5 w-3.5 shrink-0" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" fill="none" stroke="currentColor">
      <circle cx="100" cy="100" r="90" strokeWidth="12" />
      <polygon points="100,50 143,82 127,133 73,133 57,82" fill="currentColor" />
      <path d="M100,50 L100,20 M143,82 L175,70 M127,133 L150,170 M73,133 L50,170 M57,82 L25,70" strokeWidth="12" strokeLinecap="round" />
    </svg>
  );
}

export function MatchGoalsLog({ match }: MatchGoalsLogProps) {
  const flag1 = getCountryFlagUrl(match.team1);
  const flag2 = getCountryFlagUrl(match.team2);
  const { t } = useTranslation();

  return (
    <div style={{ backgroundColor: "var(--card)", borderRadius: "20px", border: "1px solid var(--border)", overflow: "hidden" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--hairline-soft)", backgroundColor: "var(--card-muted)" }}>
        <div className="flex items-center gap-1.5" style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          <CircleDot className="h-3.5 w-3.5" />
          <span>{t("matchGoalsLog")}</span>
        </div>
      </div>
      <div style={{ padding: "16px" }} className="space-y-5">
        {/* Team 1 goals */}
        <div>
          <p
            className="flex items-center gap-1.5 pb-2 mb-3"
            style={{ fontSize: "13px", fontWeight: 700, color: "var(--foreground)", borderBottom: "1px solid var(--hairline-soft)" }}
          >
            {flag1 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={flag1} alt={match.team1} className="w-4 h-2.5 rounded-sm object-cover select-none" />
            )}
            <span>{match.team1}</span>
          </p>
          <div className="space-y-1.5 ml-1">
            {match.goals1?.map((g, i) => (
              <div key={i} className="flex items-center gap-2" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                <SoccerBallIcon />
                <span style={{ fontWeight: 700, color: "var(--foreground)" }}>{g.name}</span>
                <span>{g.minute}&apos;</span>
                {g.penalty && (
                  <Badge variant="outline" style={{ fontSize: "9px", padding: "0 4px", height: "16px", borderRadius: "4px", borderColor: "rgba(245,158,11,0.3)", color: "#f59e0b", fontWeight: 700 }}>
                    {t("penaltyShort")}
                  </Badge>
                )}
                {g.owngoal && (
                  <Badge variant="outline" style={{ fontSize: "9px", padding: "0 4px", height: "16px", borderRadius: "4px", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444", fontWeight: 700 }}>
                    {t("ownGoalShort")}
                  </Badge>
                )}
              </div>
            ))}
            {(!match.goals1 || match.goals1.length === 0) && (
              <p style={{ fontSize: "12px", color: "rgba(153,153,153,0.6)", fontStyle: "italic" }}>{t("noGoalsScored")}</p>
            )}
          </div>
        </div>

        {/* Team 2 goals */}
        <div>
          <p
            className="flex items-center gap-1.5 pb-2 mb-3"
            style={{ fontSize: "13px", fontWeight: 700, color: "var(--foreground)", borderBottom: "1px solid var(--hairline-soft)" }}
          >
            {flag2 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={flag2} alt={match.team2} className="w-4 h-2.5 rounded-sm object-cover select-none" />
            )}
            <span>{match.team2}</span>
          </p>
          <div className="space-y-1.5 ml-1">
            {match.goals2?.map((g, i) => (
              <div key={i} className="flex items-center gap-2" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                <SoccerBallIcon />
                <span style={{ fontWeight: 700, color: "var(--foreground)" }}>{g.name}</span>
                <span>{g.minute}&apos;</span>
                {g.penalty && (
                  <Badge variant="outline" style={{ fontSize: "9px", padding: "0 4px", height: "16px", borderRadius: "4px", borderColor: "rgba(245,158,11,0.3)", color: "#f59e0b", fontWeight: 700 }}>
                    {t("penaltyShort")}
                  </Badge>
                )}
                {g.owngoal && (
                  <Badge variant="outline" style={{ fontSize: "9px", padding: "0 4px", height: "16px", borderRadius: "4px", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444", fontWeight: 700 }}>
                    {t("ownGoalShort")}
                  </Badge>
                )}
              </div>
            ))}
            {(!match.goals2 || match.goals2.length === 0) && (
              <p style={{ fontSize: "12px", color: "rgba(153,153,153,0.6)", fontStyle: "italic" }}>{t("noGoalsScored")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
