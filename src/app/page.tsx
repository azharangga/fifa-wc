"use client";

import { useEffect, useState, useMemo } from "react";
import { Calendar, Tv, Trophy, ArrowRight, Sparkles, MapPin, Clock, Users } from "lucide-react";
import Link from "next/link";
import { StatsBanner } from "@/components/home/stats-banner";
import { TopScorers } from "@/components/standing/top-scorers";
import { MatchCard } from "@/components/match/match-card";
import { WorldCupData, Stadium, Match } from "@/lib/types";
import { getMatchStatus, organizeGroups } from "@/lib/data";
import { PageTransition } from "@/components/layout/page-transition";
import { GroupTable } from "@/components/standing/group-table";
import { HomeCarousel } from "@/components/home/home-carousel";
import { ThirdPlaceRanking } from "@/components/standing/third-place-ranking";
import { 
  MatchCardSkeleton, 
  GroupTableSkeleton, 
  StatsBannerSkeleton, 
  ThirdPlaceRankingSkeleton, 
  StadiumsTableSkeleton,
  HeroCarouselSkeleton,
  ShimmerStyle
} from "@/components/layout/loading-state";
import { ErrorState } from "@/components/layout/error-state";
import { useTranslation } from "@/components/layout/language-provider";

export default function Home() {
  const [data, setData] = useState<WorldCupData | null>(null);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    Promise.all([
      fetch("/api/worldcup").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch matches");
        return res.json();
      }),
      fetch("/api/stadiums").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch stadiums");
        return res.json();
      }),
    ])
      .then(([wcData, stadiumsData]: [WorldCupData, Stadium[]]) => {
        setData(wcData);
        setStadiums(stadiumsData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const { todayStr, tomorrowStr } = useMemo(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const pad = (n: number) => String(n).padStart(2, "0");
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const tomorrowStr = `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
    return { todayStr, tomorrowStr };
  }, []);

  const liveAndUpcomingMatches = useMemo(() => {
    if (!data) return [];
    
    // Get live matches
    const live = data.matches.filter((m) => getMatchStatus(m) === "live");
    
    // Get upcoming matches for today and tomorrow
    const upcoming = data.matches.filter((m) => {
      const status = getMatchStatus(m);
      if (status !== "upcoming") return false;
      return m.date === todayStr || m.date === tomorrowStr;
    });

    // Sort upcoming matches by date and time
    upcoming.sort((a, b) => {
      const dateDiff = a.date.localeCompare(b.date);
      if (dateDiff !== 0) return dateDiff;
      return (a.time || "").localeCompare(b.time || "");
    });

    return [...live, ...upcoming];
  }, [data, todayStr, tomorrowStr]);

  const groups = useMemo(() => {
    if (!data) return [];
    return organizeGroups(data.matches);
  }, [data]);

  const thirdPlaceStandings = useMemo(() => {
    if (groups.length === 0) return [];
    const thirds = groups
      .map((g) => {
        const team = g.standings[2];
        if (!team) return null;
        return {
          ...team,
          groupName: g.name,
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);

    return thirds.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });
  }, [groups]);

  const qualifyingThirdNames = useMemo(() => {
    return thirdPlaceStandings.slice(0, 8).map((t) => t.team);
  }, [thirdPlaceStandings]);

  if (error || (!loading && !data)) {
    return <ErrorState error={error || (t("home") === "Beranda" ? "Gagal memuat data siaran langsung" : "Failed to load stream data")} />;
  }

  return (
    <PageTransition className="space-y-0">
      <ShimmerStyle />
      {loading ? (
        <HeroCarouselSkeleton />
      ) : (
        <HomeCarousel data={data!} />
      )}

      {/* ─── Dashboard Rails ─ 96px section spacing per DESIGN.md ─────── */}
      <div className="max-w-6xl mx-auto px-4" style={{ paddingTop: "96px", paddingBottom: "96px" }}>
        <div className="space-y-24">
          {/* Tournament Insights Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div
                className="p-2 flex items-center justify-center"
                style={{ backgroundColor: "var(--card)", borderRadius: "10px", border: "1px solid var(--border)" }}
              >
                <Sparkles className="h-4 w-4" style={{ color: "var(--foreground)" }} />
              </div>
              <h3
                style={{
                  fontSize: "clamp(1.5rem, 3vw, 2rem)",
                  fontWeight: 500,
                  lineHeight: 1.13,
                  letterSpacing: "-1px",
                  color: "var(--foreground)",
                }}
              >
                {t("statsTitle")}
              </h3>
            </div>
            {loading ? <StatsBannerSkeleton /> : <StatsBanner data={data!} />}
          </div>

          {/* Rail 1: Live & Upcoming Matches */}
          {(loading || liveAndUpcomingMatches.length > 0) && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 flex items-center justify-center"
                    style={{ backgroundColor: "var(--card)", borderRadius: "10px", border: "1px solid var(--border)" }}
                  >
                    <Tv className="h-4 w-4" style={{ color: "var(--foreground)" }} />
                  </div>
                  <h3
                    style={{
                      fontSize: "clamp(1.5rem, 3vw, 2rem)",
                      fontWeight: 500,
                      lineHeight: 1.13,
                      letterSpacing: "-1px",
                      color: "var(--foreground)",
                    }}
                  >
                    {t("liveAndUpcoming")}
                  </h3>
                </div>
                <Link
                  href="/schedule"
                  style={{ color: "var(--foreground)", fontSize: "14px", fontWeight: 500, letterSpacing: "-0.14px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  className="hover:underline"
                >
                  <span>{t("home") === "Beranda" ? "Lihat Semua" : "See All"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <MatchCardSkeleton key={i} />
                  ))
                ) : (
                  liveAndUpcomingMatches.slice(0, 6).map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* No matches today/tomorrow placeholder */}
          {!loading && liveAndUpcomingMatches.length === 0 && (
            <div
              style={{
                backgroundColor: "var(--card)",
                borderRadius: "20px",
                border: "1px solid var(--border)",
                padding: "48px 24px",
              }}
              className="text-center space-y-4 flex flex-col items-center justify-center"
            >
              <p style={{ color: "var(--muted-foreground)", fontSize: "15px", fontWeight: 400, letterSpacing: "-0.15px" }}>
                {t("home") === "Beranda" 
                  ? "Tidak ada pertandingan yang berlangsung hari ini atau besok." 
                  : "No matches scheduled for today or tomorrow."}
              </p>
              <Link
                href="/schedule"
                className="btn-primary inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                style={{ padding: "8px 16px", borderRadius: "100px", fontSize: "13px", height: "36px", backgroundColor: "var(--foreground)", color: "var(--background)" }}
              >
                <span>{t("home") === "Beranda" ? "Lihat Jadwal Lengkap" : "View Full Schedule"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}


          {/* Bottom Grid: Standings / Top Scorers */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-12">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="p-2 flex items-center justify-center"
                      style={{ backgroundColor: "var(--card)", borderRadius: "10px", border: "1px solid var(--border)" }}
                    >
                      <Trophy className="h-4 w-4" style={{ color: "var(--foreground)" }} />
                    </div>
                    <h3
                      style={{
                        fontSize: "clamp(1.5rem, 3vw, 2rem)",
                        fontWeight: 500,
                        lineHeight: 1.13,
                        letterSpacing: "-1px",
                        color: "var(--foreground)",
                      }}
                    >
                      {t("groupsTitle")}
                    </h3>
                  </div>
                  <Link
                    href="/standing"
                    style={{ color: "var(--foreground)", fontSize: "14px", fontWeight: 500, letterSpacing: "-0.14px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                    className="hover:underline"
                  >
                    <span>{t("home") === "Beranda" ? "Lihat Semua" : "See All"}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {loading ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <GroupTableSkeleton />
                    <GroupTableSkeleton />
                  </div>
                ) : groups.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {groups.slice(0, 2).map((group) => (
                      <GroupTable
                        key={group.name}
                        group={group}
                        qualifyingThirds={qualifyingThirdNames}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: "var(--card)",
                      borderRadius: "20px",
                      border: "1px solid var(--border)",
                      padding: "48px 24px",
                    }}
                    className="text-center"
                  >
                    <p style={{ color: "var(--muted-foreground)", fontSize: "15px", fontWeight: 400, letterSpacing: "-0.15px" }}>
                      {t("home") === "Beranda" ? "Lihat klasemen lengkap di halaman " : "View complete standings on the "}
                      <Link href="/standing" style={{ color: "var(--foreground)", fontWeight: 500 }} className="hover:underline">
                        {t("standing")}
                      </Link>
                      .
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="h-full">
              {loading ? (
                <div className="p-5 rounded-[20px] border border-[var(--border)] space-y-4 h-full" style={{ backgroundColor: "var(--card)" }}>
                  <div className="w-32 h-5 rounded shimmer-bg" />
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3 justify-between py-2 border-b border-[var(--border)] last:border-0">
                      <div className="w-1/2 h-4 rounded shimmer-bg" />
                      <div className="w-10 h-4 rounded shimmer-bg" />
                    </div>
                  ))}
                </div>
              ) : (
                <TopScorers data={data!} />
              )}
            </div>
          </div>

          {loading ? (
            <ThirdPlaceRankingSkeleton />
          ) : (
            <ThirdPlaceRanking thirdPlaceStandings={thirdPlaceStandings} />
          )}

          {/* Stadiums Table */}
          {(loading || stadiums.length > 0) && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 flex items-center justify-center"
                  style={{ backgroundColor: "var(--card)", borderRadius: "10px", border: "1px solid var(--border)" }}
                >
                  <MapPin className="h-4 w-4" style={{ color: "var(--foreground)" }} />
                </div>
                <h3
                  style={{
                    fontSize: "clamp(1.5rem, 3vw, 2rem)",
                    fontWeight: 500,
                    lineHeight: 1.13,
                    letterSpacing: "-1px",
                    color: "var(--foreground)",
                  }}
                >
                  {t("stadiumsTitle")}
                </h3>
              </div>
              {loading ? (
                <StadiumsTableSkeleton />
              ) : (
                <div
                  style={{
                    backgroundColor: "var(--card)",
                    borderRadius: "20px",
                    border: "1px solid var(--border)",
                    overflow: "hidden",
                  }}
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr
                          className="text-xs uppercase tracking-wider"
                          style={{ borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)" }}
                        >
                          <th className="text-left py-3 px-4 font-semibold">#</th>
                          <th className="text-left py-3 px-4 font-semibold">{t("stadiums") === "Stadion" ? "Stadion" : "Stadium"}</th>
                          <th className="text-left py-3 px-4 font-semibold">{t("hostCity")}</th>
                          <th className="text-right py-3 px-4 font-semibold">{t("capacity")}</th>
                          <th className="text-left py-3 px-4 font-semibold">{t("timezone")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stadiums.map((s, i) => {
                          const countryFlag = s.cc === "us" ? "🇺🇸" : s.cc === "mx" ? "🇲🇽" : "🇨🇦";
                          return (
                            <tr
                              key={s.name}
                              className="transition-colors hover:bg-[var(--hover-bg)]"
                              style={{ borderBottom: i < stadiums.length - 1 ? "1px solid var(--border)" : "none" }}
                            >
                              <td className="py-2.5 px-4">
                                <span
                                  className="inline-flex items-center justify-center font-bold"
                                  style={{
                                    width: "24px",
                                    height: "24px",
                                    borderRadius: "6px",
                                    backgroundColor: "var(--muted)",
                                    color: "var(--muted-foreground)",
                                    fontSize: "11px",
                                  }}
                                >
                                  {i + 1}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 font-medium" style={{ color: "var(--foreground)", letterSpacing: "-0.14px" }}>
                                {s.name}
                              </td>
                              <td className="py-2.5 px-4" style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>
                                <span className="inline-flex items-center gap-1.5">
                                  <span>{countryFlag}</span>
                                  <span>{s.city}</span>
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-right font-bold tabular-nums" style={{ color: "var(--foreground)", fontSize: "13px" }}>
                                {s.capacity.toLocaleString()}
                              </td>
                              <td className="py-2.5 px-4" style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {s.timezone}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Summary footer */}
                  <div
                    className="flex items-center justify-center gap-6 py-3 text-xs"
                    style={{ borderTop: "1px solid var(--border)", color: "var(--muted-foreground)" }}
                  >
                    <span className="inline-flex items-center gap-1">🇺🇸 {stadiums.filter((s) => s.cc === "us").length} USA</span>
                    <span className="inline-flex items-center gap-1">🇲🇽 {stadiums.filter((s) => s.cc === "mx").length} Mexico</span>
                    <span className="inline-flex items-center gap-1">🇨🇦 {stadiums.filter((s) => s.cc === "ca").length} Canada</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}