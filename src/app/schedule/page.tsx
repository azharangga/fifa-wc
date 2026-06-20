"use client";

import { useEffect, useState, useMemo } from "react";
import { Calendar, ChevronDown, Search } from "lucide-react";
import { MatchCard } from "@/components/match/match-card";
import { WorldCupData, Match } from "@/lib/types";
import { formatDate, getMatchStatus, getMatchWibDateStr } from "@/lib/data";
import { PageTransition } from "@/components/layout/page-transition";
import { MatchCardSkeleton, ShimmerStyle } from "@/components/layout/loading-state";
import { ErrorState } from "@/components/layout/error-state";
import { useTranslation } from "@/components/layout/language-provider";

export default function SchedulePage() {
  const [data, setData] = useState<WorldCupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "completed" | "upcoming">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleDatesCount, setVisibleDatesCount] = useState(15);
  const { t, lang } = useTranslation();
  const isId = lang === "id";

  useEffect(() => {
    fetch("/api/worldcup")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch matches");
        return res.json();
      })
      .then((d: WorldCupData) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredMatches = useMemo(() => {
    if (!data) return [];
    let matches = data.matches;
    if (filter !== "all") {
      matches = matches.filter((m) => getMatchStatus(m) === filter);
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      matches = matches.filter(
        (m) =>
            m.team1.toLowerCase().includes(q) ||
            m.team2.toLowerCase().includes(q) ||
            (m.ground && m.ground.toLowerCase().includes(q)) ||
            (m.hostCity && m.hostCity.toLowerCase().includes(q)) ||
            (m.group && m.group.toLowerCase().includes(q))
      );
    }
    return matches;
  }, [data, filter, searchQuery]);

  const groupedMatches = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of filteredMatches) {
      const key = isId ? getMatchWibDateStr(m.date, m.time) : m.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredMatches, isId]);

  const displayedGroupedMatches = useMemo(() => {
    return groupedMatches.slice(0, visibleDatesCount);
  }, [groupedMatches, visibleDatesCount]);

  useEffect(() => {
    setVisibleDatesCount(15);
  }, [filter, searchQuery, lang]);

  if (error || (!loading && !data)) {
    return <ErrorState error={error || (isId ? "Gagal memuat data" : "Failed to load data")} />;
  }

  return (
    <PageTransition className="max-w-7xl mx-auto px-4" style={{ paddingTop: "48px", paddingBottom: "96px" }}>
      <ShimmerStyle />
      <div className="space-y-12">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 flex items-center justify-center"
            style={{ backgroundColor: "var(--card)", borderRadius: "10px", border: "1px solid var(--border)" }}
          >
            <Calendar className="h-5 w-5" style={{ color: "var(--foreground)" }} />
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
              {t("scheduleTitle")}
            </h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "15px", fontWeight: 400, letterSpacing: "-0.15px", marginTop: "4px" }}>
              {t("scheduleSubtitle")}
            </p>
          </div>
        </div>

        {/* Search and Filters container */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Filter pills — DESIGN.md pricing-tab style */}
          <div
            className="flex gap-1.5 p-1 w-fit shrink-0"
            style={{ backgroundColor: "var(--background)", borderRadius: "100px", border: "1px solid var(--border)" }}
          >
            {([
              { key: "all", label: t("tabAll") },
              { key: "completed", label: isId ? "Selesai" : "Completed" },
              { key: "upcoming", label: isId ? "Mendatang" : "Upcoming" },
            ] as const).map((f) => {
              const isActive = filter === f.key;
              const count = !data 
                ? 0 
                : f.key === "all"
                  ? data.matches.length
                  : data.matches.filter((m) => getMatchStatus(m) === f.key).length;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className="transition-all duration-200 flex items-center gap-1.5"
                  style={{
                    backgroundColor: isActive ? "var(--secondary)" : "transparent",
                    color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                    borderRadius: "100px",
                    padding: "8px 14px",
                    fontSize: "14px",
                    fontWeight: 500,
                    letterSpacing: "-0.14px",
                    lineHeight: 1,
                    border: "none",
                    cursor: "pointer",
                    fontFeatureSettings: '"cv11"',
                  }}
                >
                  <span>{f.label}</span>
                  <span
                    style={{
                      backgroundColor: isActive ? "var(--border)" : "var(--tint-bg)",
                      color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                      borderRadius: "6px",
                      padding: "1px 6px",
                      fontSize: "10px",
                      fontWeight: 700,
                      border: "1px solid var(--border)",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={isId ? "Cari tim, grup, stadion..." : "Search team, group, venue..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-card border border-border focus:border-foreground focus:outline-none transition-colors"
              style={{ borderRadius: "100px", color: "var(--foreground)" }}
            />
          </div>
        </div>

        {/* Grouped matches */}
        <div className="space-y-10">
          {loading ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <MatchCardSkeleton key={i} />
              ))}
            </div>
          ) : displayedGroupedMatches.length === 0 ? (
            <div
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "20px",
                padding: "48px 24px",
                textAlign: "center",
                color: "var(--muted-foreground)",
                fontSize: "15px",
              }}
            >
              {isId ? "Tidak ada pertandingan yang cocok dengan saringan." : "No matches found for this filter."}
            </div>
          ) : (
            <div className="space-y-10">
              {displayedGroupedMatches.map(([date, dateMatches]) => (
                <div key={date} className="space-y-5">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        letterSpacing: "-0.15px",
                        color: "var(--foreground)",
                      }}
                    >
                      {formatDate(date, lang)}
                    </h3>
                    <div className="h-px flex-1 ml-2" style={{ backgroundColor: "var(--border)" }} />
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "6px",
                        backgroundColor: "var(--card)",
                        color: "var(--muted-foreground)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {isId ? `${dateMatches.length} pertandingan` : `${dateMatches.length} match${dateMatches.length > 1 ? "es" : ""}`}
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {dateMatches.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              ))}

              {groupedMatches.length > visibleDatesCount && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setVisibleDatesCount((prev) => prev + 5)}
                    className="btn-secondary flex items-center gap-1.5"
                  >
                    <span>{isId ? "Lihat Lebih Banyak" : "Show More"}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}

