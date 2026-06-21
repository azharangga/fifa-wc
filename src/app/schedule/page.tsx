"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Calendar, ChevronDown, Search, LayoutGrid, List, Trophy } from "lucide-react";
import { MatchCard } from "@/components/match/match-card";
import { WorldCupData, Match } from "@/lib/types";
import {
  formatDate,
  getMatchStatus,
  getMatchWibDateStr,
  getMatchStartTimeMs,
  getCountryFlagUrl,
  convertTimeToUserTimezone,
} from "@/lib/data";
import { PageTransition } from "@/components/layout/page-transition";
import { MatchCardSkeleton, ShimmerStyle } from "@/components/layout/loading-state";
import { ErrorState } from "@/components/layout/error-state";
import { useTranslation } from "@/components/layout/language-provider";

export default function SchedulePage() {
  const [data, setData] = useState<WorldCupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "live" | "completed" | "upcoming">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleDatesCount, setVisibleDatesCount] = useState(15);
  const [viewMode, setViewMode] = useState<"card" | "list" | "calendar">("card");
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
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
    // Sort matches on the same day from earliest to latest time
    for (const key of map.keys()) {
      map.get(key)!.sort((a, b) => getMatchStartTimeMs(a) - getMatchStartTimeMs(b));
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredMatches, isId]);

  const calendarMatchesMap = useMemo(() => {
    const map = new Map<string, Match[]>();
    for (const m of filteredMatches) {
      const key = isId ? getMatchWibDateStr(m.date, m.time) : m.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    for (const key of map.keys()) {
      map.get(key)!.sort((a, b) => getMatchStartTimeMs(a) - getMatchStartTimeMs(b));
    }
    return map;
  }, [filteredMatches, isId]);

  const [prevFilter, setPrevFilter] = useState(filter);
  const [prevSearch, setPrevSearch] = useState(searchQuery);
  const [prevLang, setPrevLang] = useState(lang);

  if (filter !== prevFilter || searchQuery !== prevSearch || lang !== prevLang) {
    setPrevFilter(filter);
    setPrevSearch(searchQuery);
    setPrevLang(lang);
    setVisibleDatesCount(15);
  }

  const activeCalendarDate = useMemo(() => {
    if (selectedCalendarDate && calendarMatchesMap.has(selectedCalendarDate)) {
      return selectedCalendarDate;
    }
    const dates = Array.from(calendarMatchesMap.keys()).sort();
    return dates[0] || null;
  }, [calendarMatchesMap, selectedCalendarDate]);

  const displayedGroupedMatches = useMemo(() => {
    return groupedMatches.slice(0, visibleDatesCount);
  }, [groupedMatches, visibleDatesCount]);

  if (error || (!loading && !data)) {
    return <ErrorState error={error || (isId ? "Gagal memuat data" : "Failed to load data")} />;
  }

  return (
    <PageTransition className="max-w-7xl mx-auto px-4" style={{ paddingBottom: "96px" }}>
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Filter pills — DESIGN.md pricing-tab style */}
          <div
            className="flex gap-1.5 p-1 w-full lg:w-fit overflow-x-auto lg:overflow-visible shrink-0"
            style={{ backgroundColor: "var(--background)", borderRadius: "100px", border: "1px solid var(--border)" }}
          >
            {([
              { key: "all", label: t("tabAll") },
              { key: "live", label: isId ? "Langsung" : "Live" },
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
                    fontSize: "13px",
                    fontWeight: 500,
                    letterSpacing: "-0.14px",
                    lineHeight: 1,
                    border: "none",
                    cursor: "pointer",
                    fontFeatureSettings: '"cv11"',
                    whiteSpace: "nowrap",
                    flexShrink: 0,
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

          <div className="flex flex-row items-center gap-3 w-full lg:w-auto">
            {/* Search bar */}
            <div className="relative flex-1 sm:flex-initial sm:w-60">
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

            {/* View toggle group — compact icon-only */}
            <div
              className="flex gap-0.5 p-1 rounded-full border border-[var(--border)] bg-[var(--card)] shrink-0"
            >
              {(
                [
                  { key: "card", icon: LayoutGrid, title: isId ? "Kartu" : "Cards" },
                  { key: "list", icon: List, title: isId ? "Daftar" : "List" },
                  { key: "calendar", icon: Calendar, title: isId ? "Kalender" : "Calendar" },
                ] as const
              ).map((v) => {
                const IconComponent = v.icon;
                const isActive = viewMode === v.key;
                return (
                  <button
                    key={v.key}
                    onClick={() => setViewMode(v.key)}
                    className="p-2 transition-all cursor-pointer rounded-full flex items-center justify-center border-none"
                    style={{
                      backgroundColor: isActive ? "var(--secondary)" : "transparent",
                      color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                      width: "32px",
                      height: "32px",
                    }}
                    title={v.title}
                    aria-label={v.title}
                  >
                    <IconComponent className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Grouped matches / views */}
        <div className="space-y-10">
          {loading ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <MatchCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredMatches.length === 0 ? (
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
          ) : viewMode === "card" ? (
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
          ) : viewMode === "list" ? (
            <MatchList matches={filteredMatches} lang={lang} />
          ) : (
            <div className="space-y-10">
              <CalendarView
                matchesMap={calendarMatchesMap}
                lang={lang}
                selectedDate={activeCalendarDate}
                onSelectDate={setSelectedCalendarDate}
              />
              {activeCalendarDate && calendarMatchesMap.has(activeCalendarDate) && (
                <div className="space-y-5">
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
                      {formatDate(activeCalendarDate, lang)}
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
                      {isId
                        ? `${calendarMatchesMap.get(activeCalendarDate)!.length} pertandingan`
                        : `${calendarMatchesMap.get(activeCalendarDate)!.length} match${
                            calendarMatchesMap.get(activeCalendarDate)!.length > 1 ? "es" : ""
                          }`}
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {calendarMatchesMap.get(activeCalendarDate)!.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
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

// ─── Subcomponents ─────────────────────────────────────────────────────────

function MatchList({ matches, lang }: { matches: Match[]; lang: string }) {
  const isId = lang === "id";
  return (
    <div className="border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--card)] shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" style={{ minWidth: "750px" }}>
          <thead>
            <tr
              className="border-b border-[var(--border)] text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider"
              style={{ backgroundColor: "var(--card)" }}
            >
              <th className="py-3.5 px-4 text-center w-12">#</th>
              <th className="py-3.5 px-4">{isId ? "WAKTU" : "TIME"}</th>
              <th className="py-3.5 px-4 text-right pr-4">{isId ? "TIM 1" : "TEAM 1"}</th>
              <th className="py-3.5 px-4 text-center w-24">{isId ? "SKOR" : "SCORE"}</th>
              <th className="py-3.5 px-4 text-left pl-4">{isId ? "TIM 2" : "TEAM 2"}</th>
              <th className="py-3.5 px-4 hidden md:table-cell">{isId ? "INFO / STADION" : "INFO / VENUE"}</th>
              <th className="py-3.5 px-4 text-center">{isId ? "AKSI" : "ACTION"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {matches.map((match) => {
              const status = getMatchStatus(match);
              const flag1 = getCountryFlagUrl(match.team1);
              const flag2 = getCountryFlagUrl(match.team2);
              const timeInfo = match.time ? convertTimeToUserTimezone(match.date, match.time, lang) : null;

              return (
                <tr
                  key={match.id}
                  className="hover:bg-[var(--hover-bg)] transition-colors text-[13px] text-[var(--foreground)]"
                >
                  <td className="py-4 px-4 text-center font-bold text-[var(--muted-foreground)]">
                    {match.matchNumber || "-"}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    {timeInfo ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold">{timeInfo.time}</span>
                        <span className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1.5">
                          {timeInfo.date}
                          {timeInfo.dateShifted && (
                            <span
                              style={{
                                fontSize: "9px",
                                fontWeight: 700,
                                padding: "1px 5px",
                                borderRadius: "5px",
                                backgroundColor: "rgba(245,158,11,0.15)",
                                color: "#f59e0b",
                                border: "1px solid rgba(245,158,11,0.25)",
                                lineHeight: "1",
                              }}
                            >
                              {isId ? "+1 hari" : "next day"}
                            </span>
                          )}
                        </span>
                      </div>
                    ) : (
                      formatDate(match.date, lang)
                    )}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      <span className="font-bold">{match.team1}</span>
                      {flag1 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={flag1}
                          alt={match.team1}
                          className="w-6 h-4 object-cover rounded-xs border border-white/10 select-none shrink-0"
                        />
                      ) : (
                        <Trophy className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    {status === "completed" && match.score?.ft ? (
                      <span className="px-2.5 py-1 rounded-md bg-[var(--secondary)] text-[var(--foreground)] font-extrabold font-mono text-[13px]">
                        {match.score.ft[0]} - {match.score.ft[1]}
                      </span>
                    ) : status === "live" ? (
                      <span className="px-2 py-0.5 rounded bg-red-500 text-white font-extrabold text-[9px] animate-pulse">
                        LIVE
                      </span>
                    ) : (
                      <span className="text-[var(--muted-foreground)] font-bold text-xs uppercase bg-[var(--secondary)] px-2 py-1 rounded-md">
                        vs
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-left">
                    <div className="inline-flex items-center gap-2 justify-start">
                      {flag2 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={flag2}
                          alt={match.team2}
                          className="w-6 h-4 object-cover rounded-xs border border-white/10 select-none shrink-0"
                        />
                      ) : (
                        <Trophy className="h-4 w-4 text-[var(--muted-foreground)] shrink-0" />
                      )}
                      <span className="font-bold">{match.team2}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <div className="flex flex-col text-[11px] text-[var(--muted-foreground)] gap-0.5">
                      <span className="font-bold text-[var(--foreground)] truncate max-w-[180px]">
                        {match.group || match.round}
                      </span>
                      <span className="truncate max-w-[180px]">
                        {match.ground}
                        {match.hostCity ? `, ${match.hostCity}` : ""}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <Link
                      href={`/match/${match.id}`}
                      className="inline-flex items-center justify-center h-7 px-3 rounded-full bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 font-bold text-[11px] transition-all"
                    >
                      <span>{status === "completed" ? (isId ? "Detail" : "Details") : (isId ? "Tonton" : "Watch")}</span>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CalendarView({
  matchesMap,
  lang,
  selectedDate,
  onSelectDate,
}: {
  matchesMap: Map<string, Match[]>;
  lang: string;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(6); // 6 = June, 7 = July
  const year = 2026;
  const isId = lang === "id";

  const monthNames = isId
    ? { 6: "Juni", 7: "Juli" }
    : { 6: "June", 7: "July" };

  const daysInMonth = currentMonth === 6 ? 30 : 31;
  const startOffset = currentMonth === 6 ? 1 : 3; // June 1 = Monday (1), July 1 = Wednesday (3)

  const weekdays = isId
    ? ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day);
  }

  return (
    <div className="space-y-6">
      {/* Month Switcher */}
      <div className="flex justify-between items-center bg-[var(--card)] border border-[var(--border)] p-1.5 rounded-full max-w-xs mx-auto">
        <button
          onClick={() => setCurrentMonth(6)}
          className="flex-1 py-1.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer border-none"
          style={{
            backgroundColor: currentMonth === 6 ? "var(--foreground)" : "transparent",
            color: currentMonth === 6 ? "var(--background)" : "var(--muted-foreground)",
          }}
        >
          {monthNames[6]} 2026
        </button>
        <button
          onClick={() => setCurrentMonth(7)}
          className="flex-1 py-1.5 px-4 rounded-full text-xs font-bold transition-all cursor-pointer border-none"
          style={{
            backgroundColor: currentMonth === 7 ? "var(--foreground)" : "transparent",
            color: currentMonth === 7 ? "var(--background)" : "var(--muted-foreground)",
          }}
        >
          {monthNames[7]} 2026
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 md:p-6 shadow-xs max-w-2xl mx-auto">
        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-3 text-center">
          {weekdays.map((wd) => (
            <div key={wd} className="text-[11px] font-bold text-[var(--muted-foreground)] py-1">
              {wd}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5 md:gap-2.5">
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square opacity-0" />;
            }

            const dateStr = `${year}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const dayMatches = matchesMap.get(dateStr) || [];
            const hasMatches = dayMatches.length > 0;
            const isSelected = selectedDate === dateStr;

            return (
              <button
                key={dateStr}
                onClick={() => hasMatches && onSelectDate(dateStr)}
                disabled={!hasMatches}
                className="aspect-square rounded-xl flex flex-col items-center justify-between p-1.5 md:p-2.5 border transition-all relative overflow-hidden"
                style={{
                  backgroundColor: isSelected
                    ? "var(--foreground)"
                    : hasMatches
                    ? "var(--secondary)"
                    : "transparent",
                  borderColor: isSelected
                    ? "var(--foreground)"
                    : hasMatches
                    ? "var(--border)"
                    : "transparent",
                  color: isSelected
                    ? "var(--background)"
                    : hasMatches
                    ? "var(--foreground)"
                    : "var(--muted-foreground)",
                  opacity: hasMatches ? 1 : 0.3,
                  cursor: hasMatches ? "pointer" : "default",
                }}
              >
                <span className="text-xs font-bold self-start md:self-auto">{day}</span>
                {hasMatches && (
                  <div className="flex items-center gap-1 self-end md:self-auto">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: isSelected ? "var(--background)" : "var(--accent-blue)",
                      }}
                    />
                    <span className="hidden md:inline text-[9px] font-extrabold" style={{ opacity: 0.8 }}>
                      {dayMatches.length} {isId ? "Laga" : "Matches"}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

