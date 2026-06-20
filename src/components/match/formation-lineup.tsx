"use client";

import { useMemo, useState } from "react";
import { Player } from "@/lib/types";
import { getCountryFlagUrl } from "@/lib/data";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FormationLineupProps {
  players: Player[];
  teamName: string;
}

// Real formations scraped from mylineups.app (World Cup 2026 data)
const TEAM_FORMATIONS: Record<string, string> = {
  "Mexico": "4-1-4-1",
  "South Africa": "4-2-3-1",
  "South Korea": "3-4-2-1",
  "Czech Republic": "3-4-2-1",
  "Bosnia & Herzegovina": "4-4-2",
  "Canada": "4-4-2",
  "Qatar": "4-3-3",
  "Switzerland": "4-2-3-1",
  "Brazil": "4-4-2",
  "Haiti": "4-2-3-1",
  "Morocco": "4-3-3",
  "Scotland": "4-2-3-1",
  "Australia": "3-4-2-1",
  "Paraguay": "4-2-3-1",
  "Turkey": "4-2-3-1",
  "USA": "3-4-2-1",
  "Cura\u00e7ao": "4-3-3",
  "Ecuador": "4-4-2",
  "Germany": "4-2-3-1",
  "Ivory Coast": "4-3-3",
  "Japan": "3-4-2-1",
  "Netherlands": "4-2-3-1",
  "Sweden": "3-4-3",
  "Tunisia": "4-2-3-1",
  "Belgium": "4-2-3-1",
  "Egypt": "4-2-3-1",
  "Iran": "4-3-3",
  "New Zealand": "4-2-3-1",
  "Cape Verde": "4-2-3-1",
  "Saudi Arabia": "4-2-3-1",
  "Spain": "4-3-3",
  "Uruguay": "4-4-1-1",
  "France": "4-2-3-1",
  "Iraq": "4-4-2",
  "Norway": "4-3-3",
  "Senegal": "4-3-3",
  "Algeria": "4-2-3-1",
  "Argentina": "4-3-3",
  "Austria": "4-2-3-1",
  "Jordan": "3-4-3",
  "Colombia": "4-2-3-1",
  "DR Congo": "4-4-2",
  "Portugal": "4-2-3-1",
  "Uzbekistan": "3-4-2-1",
  "Croatia": "4-2-3-1",
  "England": "4-2-3-1",
  "Ghana": "3-4-2-1",
  "Panama": "3-4-2-1",
};

// Parse a formation string like "4-2-3-1" into pitch lines
// Returns lines from attack to defence: e.g. "4-2-3-1" → [{pos:"FW",count:1},{pos:"AM",count:3},{pos:"MF",count:2},{pos:"DF",count:4}]
interface PitchLine { label: string; pos: string; count: number }

function parseFormation(formation: string): PitchLine[] {
  const parts = formation.split("-").map(Number);
  if (parts.length === 3) {
    // 4-3-3 style: DF-MF-FW
    return [
      { label: "FW", pos: "FW", count: parts[2] },
      { label: "MF", pos: "MF", count: parts[1] },
      { label: "DF", pos: "DF", count: parts[0] },
    ];
  }
  if (parts.length === 4) {
    // 4-2-3-1 style: DF-DM-AM-FW
    return [
      { label: "FW", pos: "FW", count: parts[3] },
      { label: "AM", pos: "MF", count: parts[2] },
      { label: "DM", pos: "MF", count: parts[1] },
      { label: "DF", pos: "DF", count: parts[0] },
    ];
  }
  // Fallback: 4-3-3
  return [
    { label: "FW", pos: "FW", count: 3 },
    { label: "MF", pos: "MF", count: 3 },
    { label: "DF", pos: "DF", count: 4 },
  ];
}

function pickStarters(players: Player[], pos: string, count: number): Player[] {
  return players
    .filter((p) => p.pos === pos)
    .sort((a, b) => a.number - b.number)
    .slice(0, count);
}

function lastName(fullName: string): string {
  const parts = fullName.split(" ");
  if (parts.length <= 1) return fullName;
  const last = parts[parts.length - 1];
  return last.length > 12 ? last.slice(0, 11) + "\u2026" : last;
}

const LINE_COLOR: Record<string, string> = {
  FW: "#e53e3e",
  AM: "#dd6b20",
  MF: "#3182ce",
  DM: "#2b6cb0",
  DF: "#38a169",
  GK: "#d69e2e",
};

// Pitch dimensions
const W = 400;
const H = 560;

export function FormationLineup({ players, teamName }: FormationLineupProps) {
  const flagUrl = getCountryFlagUrl(teamName);
  const [showBench, setShowBench] = useState(false);

  const { formationLabel, lines, starters, bench } = useMemo(() => {
    const fString = TEAM_FORMATIONS[teamName] || "4-3-3";
    const parsedLines = parseFormation(fString);

    // Pick players for each line from the pool
    const usedNames = new Set<string>();
    const gkPool = players.filter((p) => p.pos === "GK").sort((a, b) => a.number - b.number);
    const gk = gkPool[0] ? [gkPool[0]] : [];
    if (gk[0]) usedNames.add(gk[0].name);

    const linePlayers: Player[][] = [];
    for (const line of parsedLines) {
      const pool = players
        .filter((p) => p.pos === line.pos && !usedNames.has(p.name))
        .sort((a, b) => a.number - b.number);
      const picked = pool.slice(0, line.count);
      picked.forEach((p) => usedNames.add(p.name));
      linePlayers.push(picked);
    }

    // Bench = everyone not used
    const benchPlayers = players
      .filter((p) => !usedNames.has(p.name))
      .sort((a, b) => {
        const posOrder: Record<string, number> = { GK: 0, DF: 1, MF: 2, FW: 3 };
        const diff = (posOrder[a.pos] ?? 9) - (posOrder[b.pos] ?? 9);
        return diff !== 0 ? diff : a.number - b.number;
      });

    return {
      formationLabel: fString,
      lines: parsedLines,
      starters: { gk, linePlayers },
      bench: benchPlayers,
    };
  }, [players, teamName]);

  // Calculate Y positions for lines (attack at top, GK at bottom)
  // Use full pitch height: FW near top goal area, GK near bottom goal area
  const lineCount = lines.length;
  const fwY = 65;     // Forward line near opponent's penalty area
  const gkY = 555;    // GK inside own penalty area
  const span = gkY - fwY - 40; // total span for outfield lines (minus GK offset)

  function getYPositions(): number[] {
    if (lineCount === 1) return [fwY];
    if (lineCount === 2) return [fwY, fwY + span * 0.65];
    if (lineCount === 3) return [fwY, fwY + span * 0.42, fwY + span * 0.78];
    // 4 lines: FW, AM, DM, DF — spread across the pitch
    return [fwY, fwY + span * 0.3, fwY + span * 0.58, fwY + span * 0.82];
  }
  const yPositions = getYPositions();

  function getXPositions(count: number): number[] {
    if (count === 0) return [];
    if (count === 1) return [W / 2];
    const spacing = W / (count + 1);
    return Array.from({ length: count }, (_, i) => spacing * (i + 1));
  }

  return (
    <div
      style={{
        backgroundColor: "var(--card)",
        borderRadius: "20px",
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          {flagUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={flagUrl}
              alt={teamName}
              className="object-cover"
              style={{ width: "28px", height: "20px", borderRadius: "3px", border: "1px solid var(--border)" }}
            />
          ) : null}
          <span
            className="font-semibold"
            style={{ fontSize: "14px", color: "var(--foreground)", letterSpacing: "-0.14px" }}
          >
            {teamName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="font-bold"
            style={{
              fontSize: "12px",
              padding: "3px 10px",
              borderRadius: "6px",
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            {formationLabel}
          </span>
        </div>
      </div>

      {/* Pitch SVG */}
      <div className="flex justify-center" style={{ padding: "16px 8px 8px" }}>
        <svg
          viewBox={`0 0 ${W} ${H + 40}`}
          className="w-full"
          style={{ maxWidth: "420px", height: "auto" }}
        >
          <defs>
            <linearGradient id="pitchGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a6b35" />
              <stop offset="50%" stopColor="#1e7a3d" />
              <stop offset="100%" stopColor="#1a6b35" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width={W} height={H + 40} rx="12" fill="url(#pitchGrad)" />

          {/* Pitch markings */}
          <rect x="20" y="20" width={W - 40} height={H} rx="2" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <line x1="20" y1={20 + H / 2} x2={W - 20} y2={20 + H / 2} stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <circle cx={W / 2} cy={20 + H / 2} r="50" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <circle cx={W / 2} cy={20 + H / 2} r="3" fill="rgba(255,255,255,0.3)" />

          {/* Top penalty area */}
          <rect x={W / 2 - 80} y="20" width="160" height="70" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <rect x={W / 2 - 45} y="20" width="90" height="30" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <path d={`M ${W / 2 - 40} 90 A 40 40 0 0 0 ${W / 2 + 40} 90`} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

          {/* Bottom penalty area */}
          <rect x={W / 2 - 80} y={H - 50} width="160" height="70" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <rect x={W / 2 - 45} y={H - 20} width="90" height="30" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <path d={`M ${W / 2 - 40} ${H - 50} A 40 40 0 0 1 ${W / 2 + 40} ${H - 50}`} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

          {/* Stripes */}
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x="20" y={20 + i * (H / 8)} width={W - 40} height={H / 8} fill={i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent"} />
          ))}

          {/* Outfield lines (attack → defence) */}
          {lines.map((line, lineIdx) => {
            const linePlayers = starters.linePlayers[lineIdx] || [];
            const xPos = getXPositions(linePlayers.length);
            const y = yPositions[lineIdx];
            const color = LINE_COLOR[line.label] || "#3182ce";
            return linePlayers.map((p, i) => (
              <PlayerDot key={p.name} x={xPos[i]} y={y} number={p.number} name={lastName(p.name)} color={color} />
            ));
          })}

          {/* Goalkeeper */}
          {starters.gk.map((p) => (
            <PlayerDot key={p.name} x={W / 2} y={gkY} number={p.number} name={lastName(p.name)} color={LINE_COLOR.GK} />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div
        className="flex items-center justify-center gap-3 py-2.5 flex-wrap"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        {lines.map((line) => (
          <div key={line.label} className="flex items-center gap-1.5">
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: LINE_COLOR[line.label] || "#3182ce" }} />
            <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 600 }}>
              {line.label} ({line.count})
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: LINE_COLOR.GK }} />
          <span style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 600 }}>GK</span>
        </div>
      </div>

      {/* Substitutes / Bench */}
      {bench.length > 0 && (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={() => setShowBench(!showBench)}
            className="w-full flex items-center justify-center gap-2 py-2.5 transition-colors hover:bg-[var(--hover-bg)]"
            style={{ color: "var(--muted-foreground)", fontSize: "13px", fontWeight: 500, letterSpacing: "-0.13px" }}
          >
            <span>
              {showBench ? "Hide Substitutes" : `Substitutes (${bench.length})`}
            </span>
            {showBench ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showBench && (
            <div className="pb-2 px-3">
              <div
                className="grid gap-1.5"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
              >
                {bench.map((p) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-2.5 px-3 py-2"
                    style={{
                      borderRadius: "10px",
                      backgroundColor: "var(--muted)",
                    }}
                  >
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className="flex items-center justify-center font-bold"
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "6px",
                          backgroundColor: "var(--card)",
                          color: "var(--foreground)",
                          fontSize: "11px",
                        }}
                      >
                        {p.number || "-"}
                      </span>
                      <span
                        className="font-bold"
                        style={{
                          fontSize: "9px",
                          padding: "1px 5px",
                          borderRadius: "4px",
                          backgroundColor: LINE_COLOR[p.pos] || "var(--muted)",
                          color: "#fff",
                        }}
                      >
                        {p.pos}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate font-medium"
                        style={{ fontSize: "12px", color: "var(--foreground)", letterSpacing: "-0.1px" }}
                      >
                        {p.name}
                      </p>
                      <p
                        className="truncate"
                        style={{ fontSize: "10px", color: "var(--muted-foreground)" }}
                      >
                        {p.club.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PlayerDot({
  x, y, number, name, color,
}: {
  x: number; y: number; number: number; name: string; color: string;
}) {
  return (
    <g>
      <ellipse cx={x} cy={y + 18} rx="14" ry="4" fill="rgba(0,0,0,0.2)" />
      <circle cx={x} cy={y} r="16" fill={color} stroke="rgba(255,255,255,0.9)" strokeWidth="2" />
      <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="11" fontWeight="700" fontFamily="system-ui, sans-serif">
        {number || "-"}
      </text>
      <text x={x} y={y + 30} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="600" fontFamily="system-ui, sans-serif" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
        {name}
      </text>
    </g>
  );
}
