"use client";

import { Match } from "@/lib/types";
import { getCountryFlagUrl } from "@/lib/data";

interface MatchScoreCardProps {
  match: Match;
}

export function MatchScoreCard({ match }: MatchScoreCardProps) {
  const flag1 = getCountryFlagUrl(match.team1);
  const flag2 = getCountryFlagUrl(match.team2);

  return (
    <div
      className="flex items-center justify-between gap-3 sm:gap-6 p-3 sm:p-5"
      style={{ borderRadius: "20px", backgroundColor: "var(--card)", border: "1px solid var(--border)" }}
    >
      {/* Team 1 */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
        <div
          className="w-9 h-6 sm:w-12 sm:h-8 overflow-hidden shrink-0 flex items-center justify-center"
          style={{ borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--tint-bg)" }}
        >
          {flag1 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={flag1} alt={match.team1} className="w-full h-full object-cover select-none" />
          ) : (
            <span style={{ fontSize: "16px" }}>🏆</span>
          )}
        </div>
        <span style={{ fontWeight: 700, fontSize: "clamp(13px, 3.8vw, 18px)", letterSpacing: "-0.18px", color: "var(--foreground)" }} className="truncate">
          {match.team1}
        </span>
      </div>

      {/* Score */}
      <div
        className="shrink-0 px-3 py-1.5 sm:px-5 sm:py-2.5"
        style={{ borderRadius: "20px", backgroundColor: "var(--secondary)", border: "1px solid var(--border)" }}
      >
        {match.score?.ft ? (
          <span style={{ fontSize: "clamp(1rem, 3.5vw, 1.5rem)", fontWeight: 700, color: "var(--foreground)", fontFeatureSettings: '"tnum"' }}>
            {match.score.ft[0]} – {match.score.ft[1]}
          </span>
        ) : (
          <span style={{ color: "var(--muted-foreground)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>VS</span>
        )}
      </div>

      {/* Team 2 */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1 justify-end">
        <span style={{ fontWeight: 700, fontSize: "clamp(13px, 3.8vw, 18px)", letterSpacing: "-0.18px", color: "var(--foreground)", textAlign: "right" }} className="truncate">
          {match.team2}
        </span>
        <div
          className="w-9 h-6 sm:w-12 sm:h-8 overflow-hidden shrink-0 flex items-center justify-center"
          style={{ borderRadius: "8px", border: "1px solid var(--border)", backgroundColor: "var(--tint-bg)" }}
        >
          {flag2 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={flag2} alt={match.team2} className="w-full h-full object-cover select-none" />
          ) : (
            <span style={{ fontSize: "16px" }}>🏆</span>
          )}
        </div>
      </div>
    </div>
  );
}
