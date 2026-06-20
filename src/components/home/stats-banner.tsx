import { useMemo } from "react";
import { CircleDot, Tv, Calendar, Trophy, Flame, Shield, Zap } from "lucide-react";
import { WorldCupData, Match } from "@/lib/types";
import { useTranslation } from "../layout/language-provider";

export function StatsBanner({ data }: { data: WorldCupData }) {
  const completedMatches = data.matches.filter((m) => m.score?.ft).length;
  const totalGoals = data.matches.reduce((acc, m) => {
    if (!m.score?.ft) return acc;
    return acc + m.score.ft[0] + m.score.ft[1];
  }, 0);
  const { t } = useTranslation();

  const avgGoals = completedMatches > 0 ? (totalGoals / completedMatches).toFixed(2) : "0.00";

  // Clean sheets & top attacking team calculations
  const teamStats = useMemo(() => {
    const stats: Record<string, { goalsScored: number; cleanSheets: number }> = {};

    for (const m of data.matches) {
      if (!m.score?.ft) continue;
      const s1 = m.score.ft[0];
      const s2 = m.score.ft[1];

      if (!stats[m.team1]) stats[m.team1] = { goalsScored: 0, cleanSheets: 0 };
      if (!stats[m.team2]) stats[m.team2] = { goalsScored: 0, cleanSheets: 0 };

      stats[m.team1].goalsScored += s1;
      stats[m.team2].goalsScored += s2;

      if (s2 === 0) stats[m.team1].cleanSheets += 1;
      if (s1 === 0) stats[m.team2].cleanSheets += 1;
    }

    let topAttackingTeam = "-";
    let maxGoals = 0;
    let topDefensiveTeam = "-";
    let maxCleanSheets = 0;

    for (const [team, s] of Object.entries(stats)) {
      if (s.goalsScored > maxGoals) {
        maxGoals = s.goalsScored;
        topAttackingTeam = team;
      }
      if (s.cleanSheets > maxCleanSheets) {
        maxCleanSheets = s.cleanSheets;
        topDefensiveTeam = team;
      }
    }

    return {
      topAttackingTeam: maxGoals > 0 ? topAttackingTeam : "-",
      maxGoals,
      topDefensiveTeam: maxCleanSheets > 0 ? topDefensiveTeam : "-",
      maxCleanSheets,
    };
  }, [data.matches]);

  // Highest scoring match
  const highestScoringMatch = useMemo(() => {
    let maxGoals = -1;
    let bestMatch: Match | null = null;

    for (const m of data.matches) {
      if (!m.score?.ft) continue;
      const total = m.score.ft[0] + m.score.ft[1];
      if (total > maxGoals) {
        maxGoals = total;
        bestMatch = m;
      }
    }

    if (!bestMatch || !bestMatch.score?.ft) return { text: "-", score: "" };
    return {
      text: `${bestMatch.team1} vs ${bestMatch.team2}`,
      score: `${bestMatch.score.ft[0]}-${bestMatch.score.ft[1]}`
    };
  }, [data.matches]);

  const stats = [
    { 
      label: t("home") === "Beranda" ? "Pertandingan Selesai" : "Matches Played", 
      value: `${completedMatches}/${data.matches.length}`, 
      icon: CircleDot, 
      sub: t("home") === "Beranda" ? "Pertandingan selesai" : "Completed fixtures" 
    },
    { 
      label: t("home") === "Beranda" ? "Total Gol" : "Goals Scored", 
      value: totalGoals, 
      icon: Trophy, 
      sub: t("home") === "Beranda" ? `${avgGoals} gol per laga` : `${avgGoals} goals per game` 
    },
    { 
      label: t("cleanSheetsLeader"), 
      value: teamStats.topDefensiveTeam, 
      icon: Shield, 
      sub: teamStats.maxCleanSheets > 0 
        ? `${teamStats.maxCleanSheets} ${t("home") === "Beranda" ? "nirbobol" : "clean sheets"}` 
        : t("home") === "Beranda" ? "Belum ada laga" : "No matches played" 
    },
    { 
      label: t("topAttackingTeam"), 
      value: teamStats.topAttackingTeam, 
      icon: Flame, 
      sub: teamStats.maxGoals > 0 
        ? `${teamStats.maxGoals} ${t("home") === "Beranda" ? "gol dicetak" : "goals scored"}` 
        : t("home") === "Beranda" ? "Belum ada gol" : "No goals scored" 
    },
    { 
      label: t("highestScoringMatch"), 
      value: highestScoringMatch.score || "-", 
      icon: Zap, 
      sub: highestScoringMatch.text 
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="flex flex-col justify-between transition-all duration-300 group hover:-translate-y-0.5"
            style={{
              padding: "20px",
              backgroundColor: "var(--card)",
              borderRadius: "20px",
              border: "1px solid var(--border)",
              minHeight: "130px"
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  style={{
                    fontSize: "11px",
                    color: "var(--muted-foreground)",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {stat.label}
                </span>
                <Icon
                  className="h-4 w-4 group-hover:scale-110 transition-transform duration-300 shrink-0"
                  style={{ color: "var(--foreground)" }}
                />
              </div>
              <p
                style={{
                  fontSize: typeof stat.value === "string" && stat.value.length > 10 ? "1.25rem" : "1.75rem",
                  fontWeight: 700,
                  color: "var(--foreground)",
                  letterSpacing: "-0.5px",
                  fontFeatureSettings: '"tnum"',
                  lineHeight: 1.1,
                }}
                className="truncate"
              >
                {stat.value}
              </p>
            </div>
            {stat.sub && (
              <p className="mt-2 text-[11px] text-[var(--muted-foreground)] font-medium truncate">
                {stat.sub}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
