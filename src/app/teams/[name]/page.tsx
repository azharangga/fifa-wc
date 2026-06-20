"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, Users, Globe, LayoutList, LayoutGrid } from "lucide-react";
import { Team, WorldCupData } from "@/lib/types";
import { getCountryFlagUrl, getMatchStartTimeMs } from "@/lib/data";
import { MatchCard } from "@/components/match/match-card";
import { FormationLineup } from "@/components/match/formation-lineup";
import { PageTransition } from "@/components/layout/page-transition";
import { MatchCardSkeleton, ShimmerStyle } from "@/components/layout/loading-state";
import { ErrorState } from "@/components/layout/error-state";
import { useTranslation } from "@/components/layout/language-provider";

const POS_GROUPS = [
  { key: "GK", labelKey: "goalkeeper" as const },
  { key: "DF", labelKey: "defender" as const },
  { key: "MF", labelKey: "midfielder" as const },
  { key: "FW", labelKey: "forward" as const },
];

function computeAge(dob: string): string {
  if (!dob) return "-";
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return String(age);
}

export default function TeamDetailPage() {
  const params = useParams();
  const teamName = decodeURIComponent(params.name as string);
  const [team, setTeam] = useState<Team | null>(null);
  const [matches, setMatches] = useState<WorldCupData["matches"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "lineup">("list");
  const { t } = useTranslation();

  useEffect(() => {
    Promise.all([
      fetch("/api/teams").then((r) => r.json()),
      fetch("/api/worldcup").then((r) => r.json()),
    ])
      .then(([teamsData, wcData]: [Team[], WorldCupData]) => {
        const found = teamsData.find(
          (t) => t.name.toLowerCase() === teamName.toLowerCase()
        );
        if (!found) {
          setError(t("teams") === "Tim" ? "Tim tidak ditemukan" : "Team not found");
        } else {
          setTeam(found);
        }
        setMatches(wcData.matches ?? []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [teamName]);

  const groupMatches = useMemo(() => {
    if (!team) return [];
    return matches
      .filter(
        (m) =>
          m.group === `Group ${team.group}` &&
          (m.team1 === team.name || m.team2 === team.name)
      )
      .sort((a, b) => getMatchStartTimeMs(a) - getMatchStartTimeMs(b));
  }, [matches, team]);

  if (error || (!loading && !team)) {
    return <ErrorState error={error || "Team not found"} />;
  }

  const flagUrl = team ? getCountryFlagUrl(team.name) : null;

  return (
    <PageTransition className="max-w-7xl mx-auto px-4" style={{ paddingTop: "48px", paddingBottom: "96px" }}>
      <ShimmerStyle />
      {/* Back link */}
      <div style={{ marginBottom: "24px" }}>
        <Link
          href="/teams"
          className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
          style={{ color: "var(--muted-foreground)", letterSpacing: "-0.14px" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{t("teams")}</span>
        </Link>
      </div>

      {/* Header */}
      <div style={{ paddingBottom: "32px" }}>
        <div className="flex items-start gap-5">
          {loading ? (
            <>
              <div className="w-[80px] h-[56px] rounded-lg shimmer-bg opacity-30 shrink-0" />
              <div className="space-y-3 flex-1">
                <div className="w-56 h-7 rounded shimmer-bg" />
                <div className="flex gap-2">
                  <div className="w-16 h-5 rounded shimmer-bg opacity-40" />
                  <div className="w-16 h-5 rounded shimmer-bg opacity-40" />
                  <div className="w-16 h-5 rounded shimmer-bg opacity-40" />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Flag */}
              <div
                className="shrink-0 overflow-hidden"
                style={{
                  width: "80px",
                  height: "56px",
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                }}
              >
                {flagUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={flagUrl}
                    alt={team!.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl" style={{ backgroundColor: "var(--muted)" }}>
                    {team!.flag_icon}
                  </div>
                )}
              </div>

              <div>
                <h2
                  style={{
                    fontSize: "clamp(1.5rem, 3vw, 2rem)",
                    fontWeight: 500,
                    lineHeight: 1.13,
                    letterSpacing: "-1px",
                    color: "var(--foreground)",
                  }}
                >
                  {team!.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span
                    className="inline-flex items-center gap-1 font-bold"
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      backgroundColor: "var(--primary)",
                      color: "var(--primary-foreground)",
                    }}
                  >
                    {team!.fifa_code}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 font-semibold"
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      backgroundColor: "var(--muted)",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    Group {team!.group}
                  </span>
                  <span
                    className="inline-flex items-center gap-1"
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      backgroundColor: "var(--card)",
                      color: "var(--muted-foreground)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <Globe className="h-3 w-3" />
                    {team!.confed}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      backgroundColor: "var(--card)",
                      color: "var(--muted-foreground)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {team!.continent}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>


      {/* Squad */}
      <div style={{ paddingBottom: "48px" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" style={{ color: "var(--foreground)" }} />
            <h2
              style={{
                fontSize: "clamp(1.5rem, 3vw, 2rem)",
                fontWeight: 500,
                lineHeight: 1.13,
                letterSpacing: "-1px",
                color: "var(--foreground)",
              }}
            >
              {t("squad")}
            </h2>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "6px",
                backgroundColor: "var(--muted)",
                color: "var(--muted-foreground)",
              }}
            >
              {loading ? "-" : t("playerCount", { count: String(team?.players.length ?? 0) })}
            </span>
          </div>

          {/* Tab switcher */}
          {!loading && team && team.players.length > 0 && (
            <div
              className="flex items-center gap-0.5 p-0.5"
              style={{
                backgroundColor: "var(--muted)",
                borderRadius: "10px",
              }}
            >
              <button
                onClick={() => setActiveTab("list")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  borderRadius: "8px",
                  backgroundColor: activeTab === "list" ? "var(--card)" : "transparent",
                  color: activeTab === "list" ? "var(--foreground)" : "var(--muted-foreground)",
                  boxShadow: activeTab === "list" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                <LayoutList className="h-3.5 w-3.5" />
                <span>{t("teams") === "Tim" ? "Daftar" : "List"}</span>
              </button>
              <button
                onClick={() => setActiveTab("lineup")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  borderRadius: "8px",
                  backgroundColor: activeTab === "lineup" ? "var(--card)" : "transparent",
                  color: activeTab === "lineup" ? "var(--foreground)" : "var(--muted-foreground)",
                  boxShadow: activeTab === "lineup" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                }}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>{t("teams") === "Tim" ? "Formasi" : "Lineup"}</span>
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "var(--card)",
                  borderRadius: "16px",
                  border: "1px solid var(--border)",
                  overflow: "hidden",
                }}
              >
                <div className="px-4 py-3 bg-[var(--muted)]">
                  <div className="w-24 h-4 rounded shimmer-bg" />
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3 w-1/2">
                        <div className="w-7 h-7 rounded-lg shimmer-bg opacity-30 shrink-0" />
                        <div className="w-2/3 h-4 rounded shimmer-bg" />
                      </div>
                      <div className="w-8 h-4 rounded shimmer-bg opacity-30" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : !team || team.players.length === 0 ? (
          <div
            className="text-center py-12"
            style={{
              backgroundColor: "var(--card)",
              borderRadius: "16px",
              border: "1px solid var(--border)",
            }}
          >
            <p style={{ color: "var(--muted-foreground)", fontSize: "14px" }}>
              {t("teams") === "Tim" ? "Data skuad belum tersedia" : "Squad data not yet available"}
            </p>
          </div>
        ) : activeTab === "lineup" ? (
          <FormationLineup players={team.players} teamName={team.name} />
        ) : (
          <div className="space-y-4">
            {POS_GROUPS.map(({ key, labelKey }) => {
              const posPlayers = team.players.filter((p) => p.pos === key);
              if (posPlayers.length === 0) return null;

              return (
                <div
                  key={key}
                  style={{
                    backgroundColor: "var(--card)",
                    borderRadius: "16px",
                    border: "1px solid var(--border)",
                    overflow: "hidden",
                  }}
                >
                  {/* Position header */}
                  <div
                    className="px-4 py-2.5 font-semibold text-xs uppercase tracking-wider"
                    style={{
                      borderBottom: "1px solid var(--border)",
                      color: "var(--muted-foreground)",
                      backgroundColor: "var(--muted)",
                    }}
                  >
                    {t(labelKey)} ({posPlayers.length})
                  </div>

                  {/* Players */}
                  <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                    {posPlayers
                      .sort((a, b) => a.number - b.number)
                      .map((player) => (
                        <div
                          key={player.name}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--hover-bg)] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className="shrink-0 flex items-center justify-center font-bold"
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "8px",
                                backgroundColor: "var(--muted)",
                                color: "var(--foreground)",
                                fontSize: "12px",
                              }}
                            >
                              {player.number || "-"}
                            </span>
                            <div className="min-w-0">
                              <p
                                className="truncate font-medium"
                                style={{
                                  fontSize: "14px",
                                  color: "var(--foreground)",
                                  letterSpacing: "-0.14px",
                                }}
                              >
                                {player.name}
                              </p>
                              <p
                                className="flex items-center gap-1 truncate"
                                style={{ fontSize: "11px", color: "var(--muted-foreground)" }}
                              >
                                <span>{player.club.name}</span>
                                {player.club.country && (
                                  <span style={{ opacity: 0.6 }}>
                                    ({player.club.country})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 ml-3">
                            <span
                              className="font-bold tabular-nums"
                              style={{ fontSize: "13px", color: "var(--foreground)" }}
                            >
                              {computeAge(player.date_of_birth)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Group matches */}
      {(loading || groupMatches.length > 0) && (
        <div>
          <h2
            className="mb-4"
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 500,
              lineHeight: 1.13,
              letterSpacing: "-1px",
              color: "var(--foreground)",
            }}
          >
            {t("groupMatches")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <MatchCardSkeleton key={i} />
              ))
            ) : (
              groupMatches.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))
            )}
          </div>
        </div>
      )}

    </PageTransition>
  );
}
