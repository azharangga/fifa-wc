"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, X, Calendar, MapPin, Trophy, Sparkles, History, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWorldCupData } from "@/hooks/use-world-cup-data";
import { getCountryFlagUrl, formatDate, getMatchStatus } from "@/lib/data";
import { Match } from "@/lib/types";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useTranslation } from "./language-provider";

interface RecentSearchItem {
  id: string;
  team1: string;
  team2: string;
  date: string;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
  const { data } = useWorldCupData();
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

  // Smart Query Parsing and Filtering
  const results = useMemo(() => {
    if (!data || query.trim().length < 2) return [];

    const q = query.toLowerCase().trim();
    
    // Check if query contains versus terms like "vs", " v ", "-", or " x "
    const vsSeparator = /\s+vs\s+|\s+v\s+|\s*-\s*|\s+x\s+/i;
    const isVsQuery = vsSeparator.test(q);

    return data.matches.map((match) => {
      const matchTeam1 = match.team1.toLowerCase();
      const matchTeam2 = match.team2.toLowerCase();
      const stadium = match.ground ? match.ground.toLowerCase() : "";
      const city = match.hostCity ? match.hostCity.toLowerCase() : "";
      const group = match.group ? match.group.toLowerCase() : "";
      const round = match.round ? match.round.toLowerCase() : "";
      const dateFormatted = formatDate(match.date, lang).toLowerCase();

      let score = 0;
      let matchedReason = "";

      // 1. Versus split search (e.g. "Mexico vs South Africa")
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
            matchedReason = "Matchup";
          }
        }
      }

      // 2. Direct team matches
      if (matchTeam1 === q || matchTeam2 === q) {
        score += 80;
        matchedReason = "Exact Team Match";
      } else if (matchTeam1.startsWith(q) || matchTeam2.startsWith(q)) {
        score += 50;
        matchedReason = "Team name";
      } else if (matchTeam1.includes(q) || matchTeam2.includes(q)) {
        score += 30;
        matchedReason = "Team name";
      }

      // 3. Goalscorer match
      const scorerList1 = match.goals1 || [];
      const scorerList2 = match.goals2 || [];
      const allScorers = [...scorerList1, ...scorerList2].filter(g => !g.owngoal);
      const matchingScorer = allScorers.find(g => g.name.toLowerCase().includes(q));
      if (matchingScorer) {
        score += 40;
        matchedReason = `Goalscorer: ${matchingScorer.name}`;
      }

      // 4. Stadium or host city match
      if (stadium.includes(q) || city.includes(q)) {
        score += 25;
        matchedReason = `Location: ${match.hostCity || "Stadium"}`;
      }

      // 5. Date search
      if (match.date.includes(q) || dateFormatted.includes(q)) {
        score += 20;
        matchedReason = "Match Date";
      }

      // 6. Stage/Group search
      if (group.includes(q) || round.includes(q)) {
        score += 15;
        matchedReason = `Stage: ${match.round}`;
      }

      return { match, score, matchedReason };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => ({ ...item.match, matchedReason: item.matchedReason }));

  }, [data, query]);

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
        const selectedMatch = results[activeIndex];
        saveRecentSearch(selectedMatch);
        router.push(`/match/${selectedMatch.id}`);
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
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog Container */}
          <div
            className="relative w-full max-w-2xl flex flex-col max-h-[75vh] overflow-hidden transition-all duration-300"
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
                  {results.map((match, idx) => {
                    const status = getMatchStatus(match);
                    const flag1 = getCountryFlagUrl(match.team1);
                    const flag2 = getCountryFlagUrl(match.team2);
                    const isActive = idx === activeIndex;

                    return (
                      <Link
                        key={match.id}
                        href={`/match/${match.id}`}
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
                        {/* Round / City header */}
                        <div className="flex items-center justify-between text-[10px] text-[var(--muted-foreground)] font-bold mb-2 uppercase tracking-wide">
                          <span className="flex items-center gap-1.5">
                            <span>{match.round} • {match.group || (t("home") === "Beranda" ? "Fase Gugur" : "Knockout")}</span>
                          </span>
                          <span
                            className="px-1.5 py-0.5 rounded-full"
                            style={{
                              color: status === "live" ? "#ef4444" : status === "completed" ? "#22c55e" : "var(--muted-foreground)",
                              backgroundColor: status === "live" ? "rgba(239, 68, 68, 0.08)" : status === "completed" ? "rgba(34, 197, 94, 0.08)" : "var(--tint-bg)",
                            }}
                          >
                            {status === "live" ? t("live") : status === "completed" ? t("ft") : t("scheduled")}
                          </span>
                        </div>

                        {/* Teams & scores */}
                        <div className="flex items-center justify-between">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            {/* Team 1 */}
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-5 h-3.5 overflow-hidden shrink-0 inline-block rounded border border-[var(--border)] bg-[var(--tint-bg)]">
                                {flag1 && <img src={flag1} alt={match.team1} className="w-full h-full object-cover" />}
                              </span>
                              <span className="text-xs font-bold text-[var(--foreground)] truncate">{match.team1}</span>
                            </div>
                            {/* Team 2 */}
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-5 h-3.5 overflow-hidden shrink-0 inline-block rounded border border-[var(--border)] bg-[var(--tint-bg)]">
                                {flag2 && <img src={flag2} alt={match.team2} className="w-full h-full object-cover" />}
                              </span>
                              <span className="text-xs font-bold text-[var(--foreground)] truncate">{match.team2}</span>
                            </div>
                          </div>                           {/* Score or time */}
                          <div className="text-right ml-4 shrink-0 font-mono text-xs font-bold text-[var(--foreground)]">
                            {match.score?.ft ? (
                              <div className="flex flex-col gap-1 items-end">
                                <span>{match.score.ft[0]}</span>
                                <span>{match.score.ft[1]}</span>
                              </div>
                            ) : (
                              <span>{match.time ? match.time.split(" ")[0] : "TBD"}</span>
                            )}
                          </div>
                        </div>

                        {/* Scorers / Info footer */}
                        {((match.goals1 && match.goals1.length > 0) || (match.goals2 && match.goals2.length > 0) || match.ground) && (
                          <div className="mt-2.5 pt-2.5 border-t border-[var(--hairline-soft)] flex items-center justify-between gap-4 text-[10px] text-[var(--muted-foreground)]">
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{match.ground ? match.ground.split(",")[0] : ""}</span>
                            </span>
                            <span className="flex items-center gap-1 shrink-0">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(match.date, lang)}</span>
                            </span>
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Shortcut hints footer */}
            <div className="px-4 py-2.5 bg-[var(--tint-bg)] border-t border-[var(--border)] flex items-center justify-between text-[10px] text-[var(--muted-foreground)] font-semibold">
              <div className="flex gap-4">
                <span><kbd className="bg-[var(--card)] px-1 py-0.5 rounded border border-[var(--border)]">↑↓</kbd> {t("navigate")}</span>
                <span><kbd className="bg-[var(--card)] px-1.5 py-0.5 rounded border border-[var(--border)]">↵</kbd> {t("select")}</span>
              </div>
              <span>{t("escToClose")}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
