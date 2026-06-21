"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, X, Calendar, MapPin, Trophy, Sparkles, History, ArrowRight, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCountryFlagUrl, formatDate, getMatchStatus, convertTimeToUserTimezone } from "@/lib/data";
import { Match, Team, Stadium } from "@/lib/types";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useTranslation } from "./language-provider";

interface RecentSearchItem {
  id: string;
  team1: string;
  team2: string;
  date: string;
}

interface SearchResult {
  type: "match" | "team" | "player" | "stadium";
  id: string;
  title: string;
  subtitle: string;
  url: string;
  reason: string;
  score: number;
  match?: Match;
  flagIcon?: string;
  meta?: string;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Data States
  const [data, setData] = useState<{ name: string; matches: Match[] } | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const { t, lang } = useTranslation();

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wc2026-recent-searches");
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [isOpen]);

  // Fetch all searchable data once search modal is opened
  useEffect(() => {
    if (!isOpen) return;
    if (data && teams.length > 0 && stadiums.length > 0) return;

    Promise.all([
      fetch("/api/worldcup").then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      }),
      fetch("/api/teams").then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      }),
      fetch("/api/stadiums").then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
    ])
      .then(([wcData, teamsData, stadiumsData]) => {
        setData(wcData);
        setTeams(teamsData);
        setStadiums(stadiumsData);
      })
      .catch((err) => console.error("Global search data prefetch failed:", err));
  }, [isOpen, data, teams.length, stadiums.length]);

  // Save to recent searches
  const saveRecentSearch = (match: Match) => {
    const newItem: RecentSearchItem = {
      id: match.id,
      team1: match.team1,
      team2: match.team2,
      date: match.date,
    };
    
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.id !== match.id);
      const updated = [newItem, ...filtered].slice(0, 4);
      localStorage.setItem("wc2026-recent-searches", JSON.stringify(updated));
      return updated;
    });
  };

  // Toggle modal on Ctrl+K / Cmd+K or Slash (/)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery("");
      setActiveIndex(-1);
    }
  }, [isOpen]);

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Smart Unified Query Filtering
  const results = useMemo(() => {
    if (query.trim().length < 2) return [];

    const q = query.toLowerCase().trim();
    const list: SearchResult[] = [];

    // ─── 1. Search Matches ─────────────────────────────────────────────────────
    if (data && data.matches) {
      const vsSeparator = /\s+vs\s+|\s+v\s+|\s*-\s*|\s+x\s+/i;
      const isVsQuery = vsSeparator.test(q);

      data.matches.forEach((match) => {
        const matchTeam1 = match.team1.toLowerCase();
        const matchTeam2 = match.team2.toLowerCase();
        const stadium = match.ground ? match.ground.toLowerCase() : "";
        const city = match.hostCity ? match.hostCity.toLowerCase() : "";
        const group = match.group ? match.group.toLowerCase() : "";
        const round = match.round ? match.round.toLowerCase() : "";
        const dateFormatted = formatDate(match.date, lang).toLowerCase();

        const status = getMatchStatus(match);
        const isQueryLive = q === "live" || q === "langsung" || q === "live now" || q === "siaran langsung";

        let score = 0;
        let matchedReason = "";

        if (isQueryLive && status === "live") {
          score += 95;
          matchedReason = lang === "id" ? "Sedang Langsung" : "Live Now";
        }

        // Vs query splitting
        if (isVsQuery) {
          const parts = q.split(vsSeparator);
          if (parts.length >= 2 && parts[0] && parts[1]) {
            const p1 = parts[0].trim();
            const p2 = parts[1].trim();

            if (
              (matchTeam1.includes(p1) && matchTeam2.includes(p2)) ||
              (matchTeam1.includes(p2) && matchTeam2.includes(p1))
            ) {
              score += 100;
              matchedReason = lang === "id" ? "Kecocokan Laga" : "Matchup";
            }
          }
        }

        if (matchTeam1 === q || matchTeam2 === q) {
          score += 85;
          matchedReason = lang === "id" ? "Kecocokan Nama Tim" : "Exact Team Match";
        } else if (matchTeam1.startsWith(q) || matchTeam2.startsWith(q)) {
          score += 55;
          matchedReason = lang === "id" ? "Nama Tim" : "Team name";
        } else if (matchTeam1.includes(q) || matchTeam2.includes(q)) {
          score += 35;
          matchedReason = lang === "id" ? "Nama Tim" : "Team name";
        }

        // Scorers
        const scorerList1 = match.goals1 || [];
        const scorerList2 = match.goals2 || [];
        const allScorers = [...scorerList1, ...scorerList2].filter((g) => !g.owngoal);
        const matchingScorer = allScorers.find((g) => g.name.toLowerCase().includes(q));
        if (matchingScorer) {
          score += 45;
          matchedReason = `${lang === "id" ? "Pencetak Gol" : "Goalscorer"}: ${matchingScorer.name}`;
        }

        // Stadiums
        if (stadium.includes(q) || city.includes(q)) {
          score += 25;
          matchedReason = `${lang === "id" ? "Lokasi" : "Location"}: ${match.hostCity || "Stadium"}`;
        }

        // Dates
        if (match.date.includes(q) || dateFormatted.includes(q)) {
          score += 20;
          matchedReason = lang === "id" ? "Tanggal Laga" : "Match Date";
        }

        // Groups / Stage
        if (group.includes(q) || round.includes(q)) {
          score += 15;
          matchedReason = `${lang === "id" ? "Fase" : "Stage"}: ${match.round}`;
        }

        if (score > 0) {
          list.push({
            type: "match",
            id: match.id,
            title: `${match.team1} vs ${match.team2}`,
            subtitle: `${match.round} • ${formatDate(match.date, lang)}`,
            url: `/match/${match.id}`,
            reason: matchedReason,
            score,
            match,
          });
        }
      });
    }

    // ─── 2. Search Teams ───────────────────────────────────────────────────────
    teams.forEach((t) => {
      const name = t.name.toLowerCase();
      const code = t.fifa_code.toLowerCase();
      const group = t.group.toLowerCase();
      const confed = t.confed.toLowerCase();

      let score = 0;
      let matchedReason = "";

      if (name === q || code === q) {
        score += 90;
        matchedReason = lang === "id" ? "Tim Eksak" : "Exact Team Match";
      } else if (name.startsWith(q)) {
        score += 70;
        matchedReason = lang === "id" ? "Tim" : "Team";
      } else if (name.includes(q) || code.includes(q) || confed.includes(q) || group.includes(q)) {
        score += 40;
        matchedReason = lang === "id" ? "Tim" : "Team";
      }

      if (score > 0) {
        list.push({
          type: "team",
          id: `team-${t.name}`,
          title: t.name,
          subtitle: `${t.fifa_code} • ${t.confed} • ${lang === "id" ? "Grup" : "Group"} ${t.group}`,
          url: `/teams/${encodeURIComponent(t.name)}`,
          reason: matchedReason,
          score,
          flagIcon: getCountryFlagUrl(t.name),
        });
      }

      // ─── 3. Search Players inside Teams ──────────────────────────────────────
      if (t.players && Array.isArray(t.players)) {
        t.players.forEach((p) => {
          const playerName = p.name.toLowerCase();
          const pos = p.pos.toLowerCase();
          const clubName = p.club?.name ? p.club.name.toLowerCase() : "";

          let pScore = 0;
          let pReason = "";

          if (playerName === q) {
            pScore += 80;
            pReason = lang === "id" ? "Pemain Eksak" : "Exact Player Match";
          } else if (playerName.startsWith(q)) {
            pScore += 60;
            pReason = lang === "id" ? "Pemain" : "Player";
          } else if (playerName.includes(q)) {
            pScore += 40;
            pReason = lang === "id" ? "Pemain" : "Player";
          } else if (clubName.includes(q) || pos.includes(q)) {
            pScore += 20;
            pReason = `${lang === "id" ? "Klub" : "Club"}: ${p.club?.name || ""}`;
          }

          if (pScore > 0) {
            list.push({
              type: "player",
              id: `player-${t.name}-${p.name}`,
              title: p.name,
              subtitle: `#${p.number} ${p.pos} • ${t.name} • ${p.club?.name || ""}`,
              url: `/teams/${encodeURIComponent(t.name)}`,
              reason: pReason,
              score: pScore,
              flagIcon: getCountryFlagUrl(t.name),
            });
          }
        });
      }
    });

    // ─── 4. Search Stadiums ────────────────────────────────────────────────────
    stadiums.forEach((s) => {
      const name = s.name.toLowerCase();
      const city = s.city.toLowerCase();

      let score = 0;
      let matchedReason = "";

      if (name === q) {
        score += 75;
        matchedReason = lang === "id" ? "Stadion Eksak" : "Exact Stadium Match";
      } else if (name.includes(q)) {
        score += 50;
        matchedReason = lang === "id" ? "Stadion" : "Stadium";
      } else if (city.includes(q)) {
        score += 30;
        matchedReason = `${lang === "id" ? "Kota Tuan Rumah" : "Host City"}: ${s.city}`;
      }

      if (score > 0) {
        list.push({
          type: "stadium",
          id: `stadium-${s.name}`,
          title: s.name,
          subtitle: `${s.city}, ${s.cc} • Capacity: ${s.capacity.toLocaleString()} seats`,
          url: `/standing`, // Stadiums list is displayed on the standings page
          reason: matchedReason,
          score,
        });
      }
    });

    return list.sort((a, b) => b.score - a.score);
  }, [data, teams, stadiums, query, lang]);

  // Reset activeIndex when query changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  // Handle keyboard navigation inside search input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = Math.min(prev + 1, results.length - 1);
        scrollIntoView(next);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = Math.max(prev - 1, -1);
        scrollIntoView(next);
        return next;
      });
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < results.length) {
        e.preventDefault();
        const selected = results[activeIndex];
        if (selected.type === "match" && selected.match) {
          saveRecentSearch(selected.match);
        }
        router.push(selected.url);
        setIsOpen(false);
      }
    }
  };

  // Helper to scroll active item into view
  const scrollIntoView = (index: number) => {
    if (!resultsContainerRef.current) return;
    const container = resultsContainerRef.current;
    const children = container.querySelectorAll("[data-search-item]");
    const activeElement = children[index] as HTMLElement;
    
    if (activeElement) {
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const elemTop = activeElement.offsetTop;
      const elemBottom = elemTop + activeElement.clientHeight;

      if (elemTop < containerTop) {
        container.scrollTop = elemTop - 8;
      } else if (elemBottom > containerBottom) {
        container.scrollTop = elemBottom - container.clientHeight + 8;
      }
    }
  };

  return (
    <>
      {/* Search trigger button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--hover-bg)] transition-all select-none text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            style={{ height: "36px" }}
          >
            <Search className="h-4 w-4" />
            <span className="text-xs font-semibold hidden md:inline">{t("home") === "Beranda" ? "Cari..." : "Search..."}</span>
            <span className="text-[10px] font-bold bg-[var(--tint-bg)] border border-[var(--border)] px-1.5 py-0.5 rounded leading-none hidden md:inline">/</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>{t("searchTooltip")}</TooltipContent>
      </Tooltip>

      {/* Modal Overlay */}
      {isOpen && mounted && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[999] flex items-start justify-center p-3 sm:p-4 pt-[5vh] sm:pt-[10vh] backdrop-blur-md animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog Container */}
          <div
            className="relative w-full max-w-2xl flex flex-col max-h-[80vh] sm:max-h-[75vh] overflow-hidden transition-all duration-300"
            style={{
              backgroundColor: "var(--card)",
              borderRadius: "20px",
              border: "1px solid var(--border)",
              boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.4)",
            }}
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)]">
              <Search className="h-5 w-5 text-[var(--muted-foreground)] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder={t("searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent border-none outline-none text-[15px] text-[var(--foreground)] placeholder-[var(--muted-foreground)] py-1"
              />
              {query && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setQuery("")}
                      className="p-1 rounded-full hover:bg-[var(--hover-bg)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{t("clearSearch")}</TooltipContent>
                </Tooltip>
              )}
              <div className="w-[1px] h-4 bg-[var(--border)] shrink-0" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full hover:bg-[var(--hover-bg)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{t("closeSearch")}</TooltipContent>
              </Tooltip>
            </div>

            {/* Content list / results scroll area */}
            <div 
              ref={resultsContainerRef}
              className="overflow-y-auto flex-grow p-2 space-y-1.5 relative scrollbar-none" 
              style={{ minHeight: "180px" }}
            >
              {query.trim().length < 2 ? (
                // Initial State: Recent Searches & Popular Suggestions
                <div className="space-y-4 p-2">
                  {recentSearches.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted-foreground)]">
                        <History className="h-3.5 w-3.5" />
                        <span>{t("recentSearches")}</span>
                      </div>
                      <div className="grid gap-1">
                        {recentSearches.map((item) => (
                          <Link
                            key={item.id}
                            href={`/match/${item.id}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[var(--hover-bg)] text-xs text-[var(--foreground)] font-medium transition-all group"
                          >
                            <span className="truncate">{item.team1} vs {item.team2}</span>
                            <span className="flex items-center gap-1.5 text-[10px] text-[var(--muted-foreground)] shrink-0 font-normal">
                              <span>{formatDate(item.date, lang)}</span>
                              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                    <div className="p-3 bg-[var(--tint-bg)] rounded-full border border-[var(--border)]">
                      <Search className="h-6 w-6 text-[var(--muted-foreground)]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[var(--foreground)]">{t("searchWc")}</p>
                      <p className="text-[11px] text-[var(--muted-foreground)] max-w-[280px]">
                        {t("searchDesc")}
                      </p>
                    </div>
                  </div>
                </div>
              ) : results.length === 0 ? (
                // No results
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                  <div className="p-3 bg-[var(--tint-bg)] rounded-full border border-[var(--border)]">
                    <X className="h-6 w-6 text-[var(--muted-foreground)]" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[var(--foreground)]">{t("noResults")}</p>
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      {t("noResultsDesc", { query })}
                    </p>
                  </div>
                </div>
              ) : (
                // Results list
                <div className="space-y-1">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted-foreground)]">
                    {t("results")} ({results.length})
                  </div>
                  {results.map((item, idx) => {
                    const isActive = idx === activeIndex;

                    // Match item rendering
                    if (item.type === "match" && item.match) {
                      const match = item.match;
                      const status = getMatchStatus(match);
                      const flag1 = getCountryFlagUrl(match.team1);
                      const flag2 = getCountryFlagUrl(match.team2);
                      const converted = match.time ? convertTimeToUserTimezone(match.date, match.time, lang) : { date: formatDate(match.date, lang), time: match.time || "TBD", dateShifted: false };

                      return (
                        <Link
                          key={item.id}
                          href={item.url}
                          data-search-item
                          onClick={() => {
                            saveRecentSearch(match);
                            setIsOpen(false);
                          }}
                          className={`block p-3 rounded-xl border transition-all ${
                            isActive 
                              ? "bg-[var(--hover-bg)] border-[var(--foreground)] shadow-sm translate-x-1" 
                              : "bg-[var(--card)] border-[var(--border)] hover:bg-[var(--hover-bg)] hover:border-[var(--muted-foreground)]"
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)] font-bold mb-2 uppercase tracking-wide">
                            <span>
                              {match.round} • {match.group || (t("home") === "Beranda" ? "Fase Gugur" : "Knockout")} • {converted.date}
                              {converted.dateShifted && (
                                <span style={{ color: "#f59e0b", marginLeft: "4px" }}>
                                  {lang === "id" ? "(+1 hari)" : "(+1 day)"}
                                </span>
                              )}
                            </span>
                            <span
                              className="px-1.5 py-0.5 rounded-full text-[9px]"
                              style={{
                                color: status === "live" ? "#ef4444" : status === "completed" ? "#22c55e" : "var(--muted-foreground)",
                                backgroundColor: status === "live" ? "rgba(239, 68, 68, 0.08)" : status === "completed" ? "rgba(34, 197, 94, 0.08)" : "var(--tint-bg)",
                              }}
                            >
                              {status === "live" ? t("live") : status === "completed" ? t("ft") : t("scheduled")}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 truncate">
                                <span className="w-5 h-3.5 overflow-hidden shrink-0 inline-block rounded border border-[var(--border)] bg-[var(--tint-bg)]">
                                  {flag1 && <img src={flag1} alt={match.team1} className="w-full h-full object-cover" />}
                                </span>
                                <span className="text-xs font-bold text-[var(--foreground)] truncate">{match.team1}</span>
                              </div>
                              <div className="flex items-center gap-2 truncate">
                                <span className="w-5 h-3.5 overflow-hidden shrink-0 inline-block rounded border border-[var(--border)] bg-[var(--tint-bg)]">
                                  {flag2 && <img src={flag2} alt={match.team2} className="w-full h-full object-cover" />}
                                </span>
                                <span className="text-xs font-bold text-[var(--foreground)] truncate">{match.team2}</span>
                              </div>
                            </div>
                            <div className="text-right ml-4 shrink-0 font-mono text-[11px] font-bold text-[var(--foreground)] white-space-nowrap">
                              {match.score?.ft ? (
                                <div className="flex flex-col gap-1 items-end">
                                  <span>{match.score.ft[0]}</span>
                                  <span>{match.score.ft[1]}</span>
                                </div>
                              ) : (
                                <span>{match.time ? converted.time : "TBD"}</span>
                              )}
                            </div>
                          </div>

                          <div className="mt-2.5 pt-2.5 border-t border-[var(--hairline-soft)] flex items-center justify-between gap-4 text-[10px] text-[var(--muted-foreground)]">
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{match.ground ? match.ground.split(",")[0] : ""}</span>
                            </span>
                            <span className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase bg-[var(--tint-bg)] px-2 py-0.5 rounded-full">
                              {item.reason}
                            </span>
                          </div>
                        </Link>
                      );
                    }

                    // Team & Player rendering
                    if (item.type === "team" || item.type === "player") {
                      return (
                        <Link
                          key={item.id}
                          href={item.url}
                          data-search-item
                          onClick={() => setIsOpen(false)}
                          className={`block p-3 rounded-xl border transition-all ${
                            isActive 
                              ? "bg-[var(--hover-bg)] border-[var(--foreground)] shadow-sm translate-x-1" 
                              : "bg-[var(--card)] border-[var(--border)] hover:bg-[var(--hover-bg)] hover:border-[var(--muted-foreground)]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              {item.flagIcon ? (
                                <img src={item.flagIcon} alt={item.title} className="w-6 h-4 object-cover rounded-sm border border-[var(--border)] shrink-0 select-none" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-[var(--tint-bg)] border border-[var(--border)] flex items-center justify-center shrink-0">
                                  <User className="h-3 w-3 text-[var(--muted-foreground)]" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-[var(--foreground)] truncate">{item.title}</div>
                                <div className="text-[10px] text-[var(--muted-foreground)] font-semibold truncate mt-0.5">{item.subtitle}</div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 items-end shrink-0 ml-4">
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--tint-bg)] text-[var(--muted-foreground)] uppercase">
                                {item.type === "team" ? (lang === "id" ? "TIM" : "TEAM") : (lang === "id" ? "PEMAIN" : "PLAYER")}
                              </span>
                              <span className="text-[8px] text-[var(--muted-foreground)] font-bold uppercase tracking-wider">{item.reason}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    }

                    // Stadium rendering
                    if (item.type === "stadium") {
                      return (
                        <Link
                          key={item.id}
                          href={item.url}
                          data-search-item
                          onClick={() => setIsOpen(false)}
                          className={`block p-3 rounded-xl border transition-all ${
                            isActive 
                              ? "bg-[var(--hover-bg)] border-[var(--foreground)] shadow-sm translate-x-1" 
                              : "bg-[var(--card)] border-[var(--border)] hover:bg-[var(--hover-bg)] hover:border-[var(--muted-foreground)]"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-[var(--tint-bg)] border border-[var(--border)] flex items-center justify-center shrink-0">
                                <MapPin className="h-4 w-4 text-[var(--muted-foreground)]" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-[var(--foreground)] truncate">{item.title}</div>
                                <div className="text-[10px] text-[var(--muted-foreground)] font-semibold truncate mt-0.5">{item.subtitle}</div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 items-end shrink-0 ml-4">
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--tint-bg)] text-[var(--muted-foreground)] uppercase">
                                {lang === "id" ? "STADION" : "STADIUM"}
                              </span>
                              <span className="text-[8px] text-[var(--muted-foreground)] font-bold uppercase tracking-wider">{item.reason}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    }

                    return null;
                  })}
                </div>
              )}
            </div>

            {/* Shortcut hints footer */}
            <div className="px-4 py-2.5 bg-[var(--tint-bg)] border-t border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--muted-foreground)] font-semibold overflow-x-auto">
              <div className="flex gap-4">
                <span><kbd className="bg-[var(--card)] px-1 py-0.5 rounded border border-[var(--border)]">↑↓</kbd> {t("navigate")}</span>
                <span><kbd className="bg-[var(--card)] px-1.5 py-0.5 rounded border border-[var(--border)]">↵</kbd> {t("select")}</span>
              </div>
              <span>{t("escToClose")}</span>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
