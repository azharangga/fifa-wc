"use client";

import { useState, useMemo } from "react";
import { Trophy, Calendar, MapPin, Eye, LayoutGrid, List, Sparkles } from "lucide-react";
import Link from "next/link";
import { Match, KnockoutRound, Score } from "@/lib/types";
import { getCountryFlagUrl, getMatchStatus, formatDate, convertTimeToUserTimezone } from "@/lib/data";
import { useTranslation } from "../layout/language-provider";
import { ShimmerStyle } from "../layout/loading-state";

interface BracketMatchCardProps {
  match: Match;
  hoveredTeam: string | null;
  setHoveredTeam: (team: string | null) => void;
  isRightWing?: boolean;
  loading?: boolean;
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function EmptyBracketSlot() {
  return (
    <div
      className="w-[200px] p-3 flex items-center justify-center backdrop-blur-md"
      style={{
        backgroundColor: "var(--card)",
        border: "1px dashed var(--border)",
        borderRadius: "14px",
        height: "72px",
      }}
    >
      <span style={{ fontSize: "18px", fontWeight: 700, color: "var(--muted-foreground)" }}>—</span>
    </div>
  );
}

function BracketMatchCard({
  match,
  hoveredTeam,
  setHoveredTeam,
  isRightWing = false,
  loading = false,
}: BracketMatchCardProps) {
  if (loading) {
    return (
      <div
        className="w-[200px] relative p-3 shrink-0 select-none"
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          height: "98px",
        }}
      >
        <ShimmerStyle />
        <div className="flex justify-between items-center mb-2">
          <div className="w-16 h-3 rounded shimmer-bg opacity-40" />
          <div className="w-8 h-3 rounded shimmer-bg opacity-30" />
        </div>
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-3.5 rounded shimmer-bg opacity-20" />
            <div className="w-20 h-3.5 rounded shimmer-bg" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-3.5 rounded shimmer-bg opacity-20" />
            <div className="w-16 h-3.5 rounded shimmer-bg" />
          </div>
        </div>
      </div>
    );
  }
  const flag1 = getCountryFlagUrl(match.team1);
  const flag2 = getCountryFlagUrl(match.team2);
  const status = getMatchStatus(match);
  const { t } = useTranslation();
  const isId = t("home") === "Beranda";

  const t1Win = match.score?.ft && match.score.ft[0] > match.score.ft[1];
  const t2Win = match.score?.ft && match.score.ft[1] > match.score.ft[0];

  const isT1Hovered = hoveredTeam ? match.team1.toLowerCase() === hoveredTeam.toLowerCase() : false;
  const isT2Hovered = hoveredTeam ? match.team2.toLowerCase() === hoveredTeam.toLowerCase() : false;
  const isAnyHovered = isT1Hovered || isT2Hovered;

  const isT1Placeholder = /^[12][A-Z]$/.test(match.team1) || /^W\d+$/.test(match.team1) || /^L\d+$/.test(match.team1) || match.team1.includes(" vs ");
  const isT2Placeholder = /^[12][A-Z]$/.test(match.team2) || /^W\d+$/.test(match.team2) || /^L\d+$/.test(match.team2) || match.team2.includes(" vs ");

  return (
    <div
      className="w-[200px] relative p-3 shrink-0 transition-all duration-300 group select-none backdrop-blur-md"
      style={{
        backgroundColor: isAnyHovered ? "var(--surface-2)" : "rgba(var(--card), 0.6)",
        background: isAnyHovered 
          ? "linear-gradient(135deg, var(--surface-2) 0%, var(--tint-bg) 100%)" 
          : "var(--card)",
        border: isAnyHovered 
          ? "1px solid var(--muted-foreground)" 
          : "1px solid var(--border)",
        borderRadius: "14px",
        boxShadow: isAnyHovered 
          ? "0 8px 24px -8px rgba(0, 0, 0, 0.15)"
          : "0 2px 6px -2px rgba(0,0,0,0.03)",
        transform: isAnyHovered ? "translateY(-2px)" : "translateY(0)",
        zIndex: isAnyHovered ? 20 : 1,
      }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-2 select-none" style={{ fontSize: "10px", color: "var(--muted-foreground)", fontWeight: 600 }}>
        <span className="truncate max-w-[110px] tracking-tight">
          {match.ground ? match.ground.split(",")[0] : "Stadium"}
        </span>
        {status === "live" ? (
          <span className="animate-pulse px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(239, 68, 68, 0.12)", color: "#ef4444", fontWeight: 800, fontSize: "8px", letterSpacing: "0.05em" }}>LIVE</span>
        ) : (
          <span className="font-medium">{match.date.substring(5)}</span>
        )}
      </div>

      <div className="space-y-1.5 relative z-10">
        {/* Team 1 */}
        <div
          onMouseEnter={() => !isT1Placeholder && setHoveredTeam(match.team1)}
          onMouseLeave={() => !isT1Placeholder && setHoveredTeam(null)}
          className="flex items-center justify-between gap-1.5 p-1 rounded-lg transition-all"
          style={{
            backgroundColor: isT1Hovered ? "var(--hover-bg)" : "transparent",
            cursor: isT1Placeholder ? "default" : "pointer",
          }}
        >
          <div className="flex items-center gap-2 truncate">
            <div
              className="w-5 h-3.5 overflow-hidden shrink-0 flex items-center justify-center rounded"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--tint-bg)" }}
            >
              {flag1 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={flag1} alt={match.team1} className="w-full h-full object-cover select-none" />
              ) : (
                <ShieldIcon className="w-2.5 h-2.5 text-[var(--muted-foreground)]" />
              )}
            </div>
            <span
              className="truncate text-[12px] tracking-tight"
              style={{
                fontWeight: t1Win || isT1Hovered ? 700 : 500,
                color: isT1Hovered || t1Win ? "var(--foreground)" : "var(--muted-foreground)",
              }}
            >
              {match.team1}
            </span>
          </div>
          {match.score?.ft && (
            <span
              className="font-mono text-[12px]"
              style={{
                fontWeight: 700,
                color: isT1Hovered || t1Win ? "var(--foreground)" : "var(--muted-foreground)",
              }}
            >
              {match.score.ft[0]}
            </span>
          )}
        </div>

        {/* Team 2 */}
        <div
          onMouseEnter={() => !isT2Placeholder && setHoveredTeam(match.team2)}
          onMouseLeave={() => !isT2Placeholder && setHoveredTeam(null)}
          className="flex items-center justify-between gap-1.5 p-1 rounded-lg transition-all"
          style={{
            backgroundColor: isT2Hovered ? "var(--hover-bg)" : "transparent",
            cursor: isT2Placeholder ? "default" : "pointer",
          }}
        >
          <div className="flex items-center gap-2 truncate">
            <div
              className="w-5 h-3.5 overflow-hidden shrink-0 flex items-center justify-center rounded"
              style={{ border: "1px solid var(--border)", backgroundColor: "var(--tint-bg)" }}
            >
              {flag2 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={flag2} alt={match.team2} className="w-full h-full object-cover select-none" />
              ) : (
                <ShieldIcon className="w-2.5 h-2.5 text-[var(--muted-foreground)]" />
              )}
            </div>
            <span
              className="truncate text-[12px] tracking-tight"
              style={{
                fontWeight: t2Win || isT2Hovered ? 700 : 500,
                color: isT2Hovered || t2Win ? "var(--foreground)" : "var(--muted-foreground)",
              }}
            >
              {match.team2}
            </span>
          </div>
          {match.score?.ft && (
            <span
              className="font-mono text-[12px]"
              style={{
                fontWeight: 700,
                color: isT2Hovered || t2Win ? "var(--foreground)" : "var(--muted-foreground)",
              }}
            >
              {match.score.ft[1]}
            </span>
          )}
        </div>
      </div>

      {/* Action details */}
      <div className="mt-2 pt-2 flex items-center justify-center border-t border-[var(--hairline-soft)]">
        <Link
          href={`/match/${match.id}`}
          className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--foreground)] hover:underline opacity-80 hover:opacity-100 transition-opacity"
        >
          <span>{isId ? "Detail Pertandingan →" : "Match Details →"}</span>
        </Link>
      </div>
    </div>
  );
}

export function KnockoutBracket({ knockouts, loading = false }: { knockouts: KnockoutRound[]; loading?: boolean }) {
  const [hoveredTeam, setHoveredTeam] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"bracket" | "list">("bracket");
  const { t, lang } = useTranslation();
  const isId = lang === "id";

  const mockMatches = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
      id: `mock-${i}`,
      team1: "—",
      team2: "—",
      date: "2026-06-20",
      time: "18:00",
      ground: "Stadium",
      hostCity: "City",
      group: "",
      round: "",
      score: { ft: [0, 0], ht: [0, 0] } as Score,
    } as Match));
  };

  // Extract individual rounds for symmetric positioning
  const r32 = useMemo(() => {
    if (loading) return mockMatches(16);
    return knockouts.find((r) => r.name === "Round of 32")?.matches || [];
  }, [knockouts, loading]);

  const r16 = useMemo(() => {
    if (loading) return mockMatches(8);
    return knockouts.find((r) => r.name === "Round of 16")?.matches || [];
  }, [knockouts, loading]);

  const qf = useMemo(() => {
    if (loading) return mockMatches(4);
    return knockouts.find((r) => r.name === "Quarter-final")?.matches || [];
  }, [knockouts, loading]);

  const sf = useMemo(() => {
    if (loading) return mockMatches(2);
    return knockouts.find((r) => r.name === "Semi-final")?.matches || [];
  }, [knockouts, loading]);

  const final = useMemo(() => {
    if (loading) return mockMatches(1);
    return knockouts.find((r) => r.name === "Final")?.matches || [];
  }, [knockouts, loading]);

  const thirdPlace = useMemo(() => {
    if (loading) return mockMatches(1);
    return knockouts.find((r) => r.name === "Match for third place")?.matches || [];
  }, [knockouts, loading]);

  // Symmetrically split brackets (Left Wing vs Right Wing)
  const leftWing = useMemo(() => {
    if (loading) {
      return {
        r32: r32.slice(0, 8),
        r16: r16.slice(0, 4),
        qf: qf.slice(0, 2),
        sf: sf.slice(0, 1),
      };
    }
    
    const findM = (num: number, list: Match[]) => list.find(m => m.matchNumber === num) || mockMatches(1)[0];

    return {
      r32: [
        findM(74, r32), findM(77, r32),
        findM(73, r32), findM(75, r32),
        findM(83, r32), findM(84, r32),
        findM(81, r32), findM(82, r32)
      ],
      r16: [
        findM(89, r16), findM(90, r16),
        findM(93, r16), findM(94, r16)
      ],
      qf: [
        findM(97, qf), findM(98, qf)
      ],
      sf: [
        findM(101, sf)
      ]
    };
  }, [r32, r16, qf, sf, loading]);

  const rightWing = useMemo(() => {
    if (loading) {
      return {
        r32: r32.slice(8),
        r16: r16.slice(4),
        qf: qf.slice(2),
        sf: sf.slice(1),
      };
    }

    const findM = (num: number, list: Match[]) => list.find(m => m.matchNumber === num) || mockMatches(1)[0];

    return {
      r32: [
        findM(76, r32), findM(78, r32),
        findM(79, r32), findM(80, r32),
        findM(86, r32), findM(88, r32),
        findM(85, r32), findM(87, r32)
      ],
      r16: [
        findM(91, r16), findM(92, r16),
        findM(95, r16), findM(96, r16)
      ],
      qf: [
        findM(99, qf), findM(100, qf)
      ],
      sf: [
        findM(102, sf)
      ]
    };
  }, [r32, r16, qf, sf, loading]);

  // Helper to trace team advancement highlighting
  const isPathActive = (matchFrom?: Match, matchTo?: Match) => {
    if (loading || !hoveredTeam || !matchFrom || !matchTo) return false;
    const tName = hoveredTeam.toLowerCase();
    const fromHasTeam = matchFrom.team1.toLowerCase() === tName || matchFrom.team2.toLowerCase() === tName;
    const toHasTeam = matchTo.team1.toLowerCase() === tName || matchTo.team2.toLowerCase() === tName;
    return fromHasTeam && toHasTeam;
  };

  // Render orthogonal SVG lines
  // Computed column X positions (200px card + 16px gap = 216px step)
  const COL_STEP = 216;
  const COL_W = 200;
  const CENTER_W = 220;
  const LX = [0, COL_STEP, COL_STEP * 2, COL_STEP * 3]; // Left: R32, R16, QF, SF
  const CX = COL_STEP * 4; // Center (Finals)
  const RX = [CX + CENTER_W + 16, CX + CENTER_W + 16 + COL_STEP, CX + CENTER_W + 16 + COL_STEP * 2, CX + CENTER_W + 16 + COL_STEP * 3]; // Right: SF, QF, R16, R32
  const TOTAL_W = RX[3] + COL_W;

  const renderSVGConnector = () => {
    const paths: { d: string; active: boolean }[] = [];
    const mid = (x1: number, x2: number) => Math.round((x1 + x2) / 2);

    // Left R32 -> Left R16
    for (let j = 0; j < 4; j++) {
      const yFrom1 = 120 + (j * 2 * 200 + 100);
      const yFrom2 = 120 + ((j * 2 + 1) * 200 + 100);
      const yTo = 120 + (j * 400 + 200);
      const x1 = LX[0] + COL_W, x2 = LX[1], mx = mid(x1, x2);
      const match1 = leftWing.r32[j * 2], match2 = leftWing.r32[j * 2 + 1], destMatch = leftWing.r16[j];
      paths.push({ d: `M ${x1},${yFrom1} H ${mx} V ${yTo} H ${x2}`, active: isPathActive(match1, destMatch) });
      paths.push({ d: `M ${x1},${yFrom2} H ${mx} V ${yTo} H ${x2}`, active: isPathActive(match2, destMatch) });
    }

    // Left R16 -> Left QF
    for (let k = 0; k < 2; k++) {
      const yFrom1 = 120 + (k * 2 * 400 + 200);
      const yFrom2 = 120 + ((k * 2 + 1) * 400 + 200);
      const yTo = 120 + (k * 800 + 400);
      const x1 = LX[1] + COL_W, x2 = LX[2], mx = mid(x1, x2);
      const match1 = leftWing.r16[k * 2], match2 = leftWing.r16[k * 2 + 1], destMatch = leftWing.qf[k];
      paths.push({ d: `M ${x1},${yFrom1} H ${mx} V ${yTo} H ${x2}`, active: isPathActive(match1, destMatch) });
      paths.push({ d: `M ${x1},${yFrom2} H ${mx} V ${yTo} H ${x2}`, active: isPathActive(match2, destMatch) });
    }

    // Left QF -> Left SF
    {
      const yFrom1 = 120 + 400, yFrom2 = 120 + 1200, yTo = 120 + 800;
      const x1 = LX[2] + COL_W, x2 = LX[3], mx = mid(x1, x2);
      const match1 = leftWing.qf[0], match2 = leftWing.qf[1], destMatch = leftWing.sf[0];
      paths.push({ d: `M ${x1},${yFrom1} H ${mx} V ${yTo} H ${x2}`, active: isPathActive(match1, destMatch) });
      paths.push({ d: `M ${x1},${yFrom2} H ${mx} V ${yTo} H ${x2}`, active: isPathActive(match2, destMatch) });
    }

    // Left SF -> Final / Third Place
    if (leftWing.sf[0]) {
      const yFrom = 120 + 800, yFinal = 120 + 600, yThird = 120 + 1000;
      const x1 = LX[3] + COL_W, x2 = CX, mx = mid(x1, x2);
      const sfMatch = leftWing.sf[0], fMatch = final[0], tMatch = thirdPlace[0];
      paths.push({ d: `M ${x1},${yFrom} H ${mx} V ${yFinal} H ${x2}`, active: isPathActive(sfMatch, fMatch) });
      paths.push({ d: `M ${x1},${yFrom} H ${mx} V ${yThird} H ${x2}`, active: isPathActive(sfMatch, tMatch) });
    }

    // Right R32 -> Right R16
    for (let j = 0; j < 4; j++) {
      const yFrom1 = 120 + (j * 2 * 200 + 100);
      const yFrom2 = 120 + ((j * 2 + 1) * 200 + 100);
      const yTo = 120 + (j * 400 + 200);
      const x1 = RX[3], x2 = RX[2] + COL_W, mx = mid(x1, x2);
      const match1 = rightWing.r32[j * 2], match2 = rightWing.r32[j * 2 + 1], destMatch = rightWing.r16[j];
      paths.push({ d: `M ${x1},${yFrom1} H ${mx} V ${yTo} H ${x2}`, active: isPathActive(match1, destMatch) });
      paths.push({ d: `M ${x1},${yFrom2} H ${mx} V ${yTo} H ${x2}`, active: isPathActive(match2, destMatch) });
    }

    // Right R16 -> Right QF
    for (let k = 0; k < 2; k++) {
      const yFrom1 = 120 + (k * 2 * 400 + 200);
      const yFrom2 = 120 + ((k * 2 + 1) * 400 + 200);
      const yTo = 120 + (k * 800 + 400);
      const x1 = RX[2], x2 = RX[1] + COL_W, mx = mid(x1, x2);
      const match1 = rightWing.r16[k * 2], match2 = rightWing.r16[k * 2 + 1], destMatch = rightWing.qf[k];
      paths.push({ d: `M ${x1},${yFrom1} H ${mx} V ${yTo} H ${x2}`, active: isPathActive(match1, destMatch) });
      paths.push({ d: `M ${x1},${yFrom2} H ${mx} V ${yTo} H ${x2}`, active: isPathActive(match2, destMatch) });
    }

    // Right QF -> Right SF
    {
      const yFrom1 = 120 + 400, yFrom2 = 120 + 1200, yTo = 120 + 800;
      const x1 = RX[1], x2 = RX[0] + COL_W, mx = mid(x1, x2);
      const match1 = rightWing.qf[0], match2 = rightWing.qf[1], destMatch = rightWing.sf[0];
      paths.push({ d: `M ${x1},${yFrom1} H ${mx} V ${yTo} H ${x2}`, active: isPathActive(match1, destMatch) });
      paths.push({ d: `M ${x1},${yFrom2} H ${mx} V ${yTo} H ${x2}`, active: isPathActive(match2, destMatch) });
    }

    // Right SF -> Final / Third Place
    if (rightWing.sf[0]) {
      const yFrom = 120 + 800, yFinal = 120 + 600, yThird = 120 + 1000;
      const x1 = RX[0], x2 = CX + CENTER_W, mx = mid(x1, x2);
      const sfMatch = rightWing.sf[0], fMatch = final[0], tMatch = thirdPlace[0];
      paths.push({ d: `M ${x1},${yFrom} H ${mx} V ${yFinal} H ${x2}`, active: isPathActive(sfMatch, fMatch) });
      paths.push({ d: `M ${x1},${yFrom} H ${mx} V ${yThird} H ${x2}`, active: isPathActive(sfMatch, tMatch) });
    }

    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {/* Underlay / Inactive Paths */}
        {paths.map((p, idx) => (
          <path
            key={`bg-${idx}`}
            d={p.d}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
        ))}
        {/* Active Highlight Paths */}
        {paths
          .filter((p) => p.active)
          .map((p, idx) => (
            <path
              key={`fg-${idx}`}
              d={p.d}
              fill="none"
              stroke="var(--foreground)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: "drop-shadow(0 0 2px var(--foreground))",
                opacity: 0.95,
              }}
              className="transition-all duration-300"
            />
          ))}
      </svg>
    );
  };

  return (
    <div className="space-y-8">
      {/* Navigation Switcher */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div className="flex bg-[var(--card)] p-1 rounded-xl border border-[var(--border)] overflow-x-auto">
          <button
            onClick={() => setActiveTab("bracket")}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
            style={{
              backgroundColor: activeTab === "bracket" ? "var(--foreground)" : "transparent",
              color: activeTab === "bracket" ? "var(--background)" : "var(--muted-foreground)",
            }}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>{isId ? "Bagan Turnamen" : "Bracket Tree"}</span>
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
            style={{
              backgroundColor: activeTab === "list" ? "var(--foreground)" : "transparent",
              color: activeTab === "list" ? "var(--background)" : "var(--muted-foreground)",
            }}
          >
            <List className="h-3.5 w-3.5" />
            <span>{isId ? "Daftar Pertandingan" : "Knockout List"}</span>
          </button>
        </div>
      </div>

      {activeTab === "bracket" ? (
        <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 select-none" style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" }}>
          <div className="relative py-4" style={{ width: `${TOTAL_W}px`, height: "1820px" }}>
            {/* SVG Connector Lines */}
            {!loading && renderSVGConnector()}
 
            {/* Columns Container */}
            <div className="absolute inset-0 pointer-events-none z-10">
              
              {/* ─── LEFT WING ─── */}
              {/* L1: Round of 32 */}
              <div className="absolute w-[200px] pointer-events-auto" style={{ left: `${LX[0]}px`, height: "1600px", marginTop: "120px" }}>
                <div className="absolute top-[-80px] left-0 w-[200px] text-center pb-2 border-b border-[var(--border)]">
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: "0.1em" }}>{t("round32").toUpperCase()}</span>
                  <p className="text-[11px] font-bold text-foreground mt-0.5">{loading ? 8 : leftWing.r32.length} {isId ? "Laga" : "Matches"}</p>
                </div>
                {leftWing.r32.map((match, idx) => (
                  <div key={match.id} className="absolute left-0 w-full" style={{ top: `${idx * 200 + 100}px`, transform: "translateY(-50%)" }}>
                    <BracketMatchCard match={match} hoveredTeam={hoveredTeam} setHoveredTeam={setHoveredTeam} loading={loading} />
                  </div>
                ))}
              </div>

              {/* L2: Round of 16 */}
              <div className="absolute w-[200px] pointer-events-auto" style={{ left: `${LX[1]}px`, height: "1600px", marginTop: "120px" }}>
                <div className="absolute top-[-80px] left-0 w-[200px] text-center pb-2 border-b border-[var(--border)]">
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: "0.1em" }}>{t("round16").toUpperCase()}</span>
                  <p className="text-[11px] font-bold text-foreground mt-0.5">{loading ? 4 : leftWing.r16.length} {isId ? "Laga" : "Matches"}</p>
                </div>
                {leftWing.r16.map((match, idx) => (
                  <div key={match.id} className="absolute left-0 w-full" style={{ top: `${idx * 400 + 200}px`, transform: "translateY(-50%)" }}>
                    <BracketMatchCard match={match} hoveredTeam={hoveredTeam} setHoveredTeam={setHoveredTeam} loading={loading} />
                  </div>
                ))}
              </div>

              {/* L3: Quarter-final */}
              <div className="absolute w-[200px] pointer-events-auto" style={{ left: `${LX[2]}px`, height: "1600px", marginTop: "120px" }}>
                <div className="absolute top-[-80px] left-0 w-[200px] text-center pb-2 border-b border-[var(--border)]">
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: "0.1em" }}>{t("quarterfinals").toUpperCase()}</span>
                  <p className="text-[11px] font-bold text-foreground mt-0.5">{loading ? 2 : leftWing.qf.length} {isId ? "Laga" : "Matches"}</p>
                </div>
                {leftWing.qf.map((match, idx) => (
                  <div key={match.id} className="absolute left-0 w-full" style={{ top: `${idx * 800 + 400}px`, transform: "translateY(-50%)" }}>
                    <BracketMatchCard match={match} hoveredTeam={hoveredTeam} setHoveredTeam={setHoveredTeam} loading={loading} />
                  </div>
                ))}
              </div>

              {/* L4: Semi-final */}
              <div className="absolute w-[200px] pointer-events-auto" style={{ left: `${LX[3]}px`, height: "1600px", marginTop: "120px" }}>
                <div className="absolute top-[-80px] left-0 w-[200px] text-center pb-2 border-b border-[var(--border)]">
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: "0.1em" }}>{t("semifinals").toUpperCase()}</span>
                  <p className="text-[11px] font-bold text-foreground mt-0.5">{loading ? 1 : leftWing.sf.length} {isId ? "Laga" : "Match"}</p>
                </div>
                {leftWing.sf.map((match) => (
                  <div key={match.id} className="absolute left-0 w-full" style={{ top: "800px", transform: "translateY(-50%)" }}>
                    <BracketMatchCard match={match} hoveredTeam={hoveredTeam} setHoveredTeam={setHoveredTeam} loading={loading} />
                  </div>
                ))}
              </div>

              {/* ─── CENTER COLUMN (Finals) ─── */}
              <div className="absolute pointer-events-auto" style={{ left: `${CX}px`, width: `${CENTER_W}px`, height: "1600px", marginTop: "120px" }}>
                <div className="absolute top-[-80px] left-0 w-full text-center pb-2 border-b border-[var(--border)]">
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: "0.1em" }}>{isId ? "KEJUARAAN" : "CHAMPIONSHIP"}</span>
                  <p className="text-[11px] font-bold text-foreground mt-0.5">
                    {loading ? 2 : final.length + thirdPlace.length > 0 
                      ? `${final.length + thirdPlace.length} ${isId ? "Laga" : "Matches"}`
                      : "-"}
                  </p>
                </div>
                
                {/* Final Card */}
                {loading ? (
                  <div className="absolute" style={{ left: `${(CENTER_W - COL_W) / 2}px`, top: "600px", transform: "translateY(-50%)" }}>
                    <div className="absolute top-[-36px] left-1/2 -translate-x-1/2 w-full text-center select-none pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20 whitespace-nowrap">
                        <Trophy className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                        <span>{t("final").toUpperCase()}</span>
                      </span>
                    </div>
                    <BracketMatchCard match={null as any} hoveredTeam={null} setHoveredTeam={() => {}} loading={true} />
                  </div>
                ) : final.length > 0 ? final.map((match) => (
                  <div key={match.id} className="absolute" style={{ left: `${(CENTER_W - COL_W) / 2}px`, top: "600px", transform: "translateY(-50%)" }}>
                    <div className="absolute top-[-36px] left-1/2 -translate-x-1/2 w-full text-center select-none pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20 whitespace-nowrap">
                        <Trophy className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                        <span>{t("final").toUpperCase()}</span>
                      </span>
                    </div>
                    <BracketMatchCard match={match} hoveredTeam={hoveredTeam} setHoveredTeam={setHoveredTeam} />
                  </div>
                )) : (
                  <div className="absolute" style={{ left: `${(CENTER_W - COL_W) / 2}px`, top: "600px", transform: "translateY(-50%)" }}>
                    <div className="absolute top-[-36px] left-1/2 -translate-x-1/2 w-full text-center select-none pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20 whitespace-nowrap">
                        <Trophy className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                        <span>{t("final").toUpperCase()}</span>
                      </span>
                    </div>
                    <EmptyBracketSlot />
                  </div>
                )}

                {/* Third Place Card */}
                {loading ? (
                  <div className="absolute" style={{ left: `${(CENTER_W - COL_W) / 2}px`, top: "1000px", transform: "translateY(-50%)" }}>
                    <div className="absolute top-[-32px] left-1/2 -translate-x-1/2 w-full text-center select-none pointer-events-none">
                      <span className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider bg-[var(--tint-bg)] px-2.5 py-1 rounded-full border border-[var(--border)] whitespace-nowrap">
                        {t("thirdPlacePlayoff")}
                      </span>
                    </div>
                    <BracketMatchCard match={null as any} hoveredTeam={null} setHoveredTeam={() => {}} loading={true} />
                  </div>
                ) : thirdPlace.length > 0 ? thirdPlace.map((match) => (
                  <div key={match.id} className="absolute" style={{ left: `${(CENTER_W - COL_W) / 2}px`, top: "1000px", transform: "translateY(-50%)" }}>
                    <div className="absolute top-[-32px] left-1/2 -translate-x-1/2 w-full text-center select-none pointer-events-none">
                      <span className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider bg-[var(--tint-bg)] px-2.5 py-1 rounded-full border border-[var(--border)] whitespace-nowrap">
                        {t("thirdPlacePlayoff")}
                      </span>
                    </div>
                    <BracketMatchCard match={match} hoveredTeam={hoveredTeam} setHoveredTeam={setHoveredTeam} />
                  </div>
                )) : (
                  <div className="absolute" style={{ left: `${(CENTER_W - COL_W) / 2}px`, top: "1000px", transform: "translateY(-50%)" }}>
                    <div className="absolute top-[-32px] left-1/2 -translate-x-1/2 w-full text-center select-none pointer-events-none">
                      <span className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider bg-[var(--tint-bg)] px-2.5 py-1 rounded-full border border-[var(--border)] whitespace-nowrap">
                        {t("thirdPlacePlayoff")}
                      </span>
                    </div>
                    <EmptyBracketSlot />
                  </div>
                )}
              </div>

              {/* ─── RIGHT WING ─── */}
              {/* R4: Semi-final */}
              <div className="absolute w-[200px] pointer-events-auto" style={{ left: `${RX[0]}px`, height: "1600px", marginTop: "120px" }}>
                <div className="absolute top-[-80px] left-0 w-[200px] text-center pb-2 border-b border-[var(--border)]">
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: "0.1em" }}>{t("semifinals").toUpperCase()}</span>
                  <p className="text-[11px] font-bold text-foreground mt-0.5">{loading ? 1 : rightWing.sf.length} {isId ? "Laga" : "Match"}</p>
                </div>
                {rightWing.sf.map((match) => (
                  <div key={match.id} className="absolute left-0 w-full" style={{ top: "800px", transform: "translateY(-50%)" }}>
                    <BracketMatchCard match={match} hoveredTeam={hoveredTeam} setHoveredTeam={setHoveredTeam} isRightWing={true} loading={loading} />
                  </div>
                ))}
              </div>

              {/* R3: Quarter-final */}
              <div className="absolute w-[200px] pointer-events-auto" style={{ left: `${RX[1]}px`, height: "1600px", marginTop: "120px" }}>
                <div className="absolute top-[-80px] left-0 w-[200px] text-center pb-2 border-b border-[var(--border)]">
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: "0.1em" }}>{t("quarterfinals").toUpperCase()}</span>
                  <p className="text-[11px] font-bold text-foreground mt-0.5">{loading ? 2 : rightWing.qf.length} {isId ? "Laga" : "Matches"}</p>
                </div>
                {rightWing.qf.map((match, idx) => (
                  <div key={match.id} className="absolute left-0 w-full" style={{ top: `${idx * 800 + 400}px`, transform: "translateY(-50%)" }}>
                    <BracketMatchCard match={match} hoveredTeam={hoveredTeam} setHoveredTeam={setHoveredTeam} isRightWing={true} loading={loading} />
                  </div>
                ))}
              </div>

              {/* R2: Round of 16 */}
              <div className="absolute w-[200px] pointer-events-auto" style={{ left: `${RX[2]}px`, height: "1600px", marginTop: "120px" }}>
                <div className="absolute top-[-80px] left-0 w-[200px] text-center pb-2 border-b border-[var(--border)]">
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: "0.1em" }}>{t("round16").toUpperCase()}</span>
                  <p className="text-[11px] font-bold text-foreground mt-0.5">{loading ? 4 : rightWing.r16.length} {isId ? "Laga" : "Matches"}</p>
                </div>
                {rightWing.r16.map((match, idx) => (
                  <div key={match.id} className="absolute left-0 w-full" style={{ top: `${idx * 400 + 200}px`, transform: "translateY(-50%)" }}>
                    <BracketMatchCard match={match} hoveredTeam={hoveredTeam} setHoveredTeam={setHoveredTeam} isRightWing={true} loading={loading} />
                  </div>
                ))}
              </div>

              {/* R1: Round of 32 */}
              <div className="absolute w-[200px] pointer-events-auto" style={{ left: `${RX[3]}px`, height: "1600px", marginTop: "120px" }}>
                <div className="absolute top-[-80px] left-0 w-[200px] text-center pb-2 border-b border-[var(--border)]">
                  <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: "0.1em" }}>{t("round32").toUpperCase()}</span>
                  <p className="text-[11px] font-bold text-foreground mt-0.5">{loading ? 8 : rightWing.r32.length} {isId ? "Laga" : "Matches"}</p>
                </div>
                {rightWing.r32.map((match, idx) => (
                  <div key={match.id} className="absolute left-0 w-full" style={{ top: `${idx * 200 + 100}px`, transform: "translateY(-50%)" }}>
                    <BracketMatchCard match={match} hoveredTeam={hoveredTeam} setHoveredTeam={setHoveredTeam} isRightWing={true} loading={loading} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ─── SCHEDULE LIST VIEW (Clean, interactive list) ─── */
        <div className="space-y-10">
          {knockouts.map((round) => (
            <div key={round.name} className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border)]">
                <h3 className="text-xs font-extrabold tracking-wider uppercase text-[var(--muted-foreground)]">
                  {round.name === "Round of 32" ? t("round32") :
                   round.name === "Round of 16" ? t("round16") :
                   round.name === "Quarter-final" ? t("quarterfinals") :
                   round.name === "Semi-final" ? t("semifinals") :
                   round.name === "Final" ? t("final") :
                   round.name === "Match for third place" ? t("thirdPlacePlayoff") : round.name}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[var(--tint-bg)] text-[var(--foreground)] border border-[var(--border)]">
                  {round.matches.length} {isId ? "pertandingan" : "matches"}
                </span>
              </div>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-[16px] border border-[var(--border)] flex flex-col justify-between"
                      style={{ backgroundColor: "var(--card)", height: "135px" }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="w-16 h-3 rounded shimmer-bg opacity-45" />
                        <div className="w-24 h-3 rounded shimmer-bg opacity-30" />
                      </div>
                      <div className="space-y-2 py-2">
                        <div className="flex gap-2">
                          <div className="w-5 h-3.5 rounded shimmer-bg opacity-20" />
                          <div className="w-32 h-4 rounded shimmer-bg" />
                        </div>
                        <div className="flex gap-2">
                          <div className="w-5 h-3.5 rounded shimmer-bg opacity-20" />
                          <div className="w-28 h-4 rounded shimmer-bg" />
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-[var(--hairline-soft)]">
                        <div className="w-12 h-3.5 rounded shimmer-bg opacity-45" />
                        <div className="w-16 h-3.5 rounded shimmer-bg opacity-45" />
                      </div>
                    </div>
                  ))
                ) : round.matches.length === 0 ? (
                  <div className="col-span-full text-center py-6" style={{ color: "var(--muted-foreground)", fontSize: "13px", fontWeight: 500 }}>—</div>
                ) : round.matches.map((match) => {
                  const flag1 = getCountryFlagUrl(match.team1);
                  const flag2 = getCountryFlagUrl(match.team2);
                  const status = getMatchStatus(match);
                  const isFinished = status === "completed";
                  const score1 = match.score?.ft ? match.score.ft[0] : "-";
                  const score2 = match.score?.ft ? match.score.ft[1] : "-";

                  return (
                    <div
                      key={match.id}
                      className="flex flex-col justify-between p-4 transition-all duration-300 hover:border-[#3b82f6] hover:shadow-lg"
                      style={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "16px",
                      }}
                    >
                      <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)] mb-3 font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[130px]">{match.ground ? match.ground.split(",")[0] : "Stadium"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {match.time ? (() => {
                            const converted = convertTimeToUserTimezone(match.date, match.time, lang);
                            return (
                              <>
                                <span>{converted.date}</span>
                                {converted.dateShifted && (
                                  <span style={{ fontSize: "8px", fontWeight: 700, padding: "1px 4px", borderRadius: "4px", backgroundColor: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}>
                                    {lang === "id" ? "+1" : "+1d"}
                                  </span>
                                )}
                                <span>•</span>
                                <span>{converted.time}</span>
                              </>
                            );
                          })() : <span>{formatDate(match.date, lang)}</span>}
                        </div>
                      </div>

                      {/* Teams & Score Row */}
                      <div className="flex items-center justify-between py-1">
                        <div className="space-y-2.5 flex-1 min-w-0">
                          {/* Team 1 */}
                          <div className="flex items-center gap-2.5 truncate">
                            <div
                              className="w-5.5 h-4 overflow-hidden shrink-0 flex items-center justify-center rounded"
                              style={{ border: "1px solid var(--border)", backgroundColor: "var(--tint-bg)", width: "22px", height: "16px" }}
                            >
                              {flag1 ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={flag1} alt={match.team1} className="w-full h-full object-cover select-none" />
                              ) : (
                                <ShieldIcon className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                              )}
                            </div>
                            <span className="font-bold text-[13px] text-[var(--foreground)] truncate">{match.team1}</span>
                          </div>

                          {/* Team 2 */}
                          <div className="flex items-center gap-2.5 truncate">
                            <div
                              className="w-5.5 h-4 overflow-hidden shrink-0 flex items-center justify-center rounded"
                              style={{ border: "1px solid var(--border)", backgroundColor: "var(--tint-bg)", width: "22px", height: "16px" }}
                            >
                              {flag2 ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={flag2} alt={match.team2} className="w-full h-full object-cover select-none" />
                              ) : (
                                <ShieldIcon className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                              )}
                            </div>
                            <span className="font-bold text-[13px] text-[var(--foreground)] truncate">{match.team2}</span>
                          </div>
                        </div>

                        {/* Scores */}
                        <div className="flex flex-col items-center justify-center gap-2.5 font-mono font-bold text-sm px-4 border-l border-[var(--hairline-soft)] min-w-[50px]">
                          <span style={{ color: isFinished ? "var(--foreground)" : "var(--muted-foreground)" }}>{score1}</span>
                          <span style={{ color: isFinished ? "var(--foreground)" : "var(--muted-foreground)" }}>{score2}</span>
                        </div>
                      </div>

                      {/* Footer Details */}
                      <div className="mt-4 pt-3 border-t border-[var(--hairline-soft)] flex items-center justify-between">
                        <span
                          className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{
                            color: status === "live" ? "#ef4444" : status === "completed" ? "#22c55e" : "var(--muted-foreground)",
                            backgroundColor: status === "live" ? "rgba(239, 68, 68, 0.08)" : status === "completed" ? "rgba(34, 197, 94, 0.08)" : "var(--tint-bg)",
                          }}
                        >
                          {status === "live" ? t("live") : status === "completed" ? (isId ? "Selesai" : "Completed") : (isId ? "Terjadwal" : "Scheduled")}
                        </span>
                        <Link
                          href={`/match/${match.id}`}
                          className="text-xs font-bold text-[var(--foreground)] hover:underline opacity-80 hover:opacity-100 transition-opacity"
                        >
                          {isId ? "Detail Pertandingan →" : "Match Details →"}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
