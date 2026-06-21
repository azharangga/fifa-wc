"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Users, Search, Globe } from "lucide-react";
import { Team } from "@/lib/types";
import { getCountryFlagUrl } from "@/lib/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageTransition } from "@/components/layout/page-transition";
import { ShimmerStyle } from "@/components/layout/loading-state";
import { ErrorState } from "@/components/layout/error-state";
import { useTranslation } from "@/components/layout/language-provider";

const CONFEDERATIONS = ["UEFA", "CONMEBOL", "CONCACAF", "AFC", "CAF", "OFC"];
const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [confedFilter, setConfedFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    fetch("/api/teams")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch teams");
        return res.json();
      })
      .then((d: Team[]) => {
        setTeams(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return teams.filter((team) => {
      if (search && !team.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (confedFilter && team.confed !== confedFilter) return false;
      if (groupFilter && team.group !== groupFilter) return false;
      return true;
    });
  }, [teams, search, confedFilter, groupFilter]);

  if (error || (!loading && teams.length === 0)) {
    return <ErrorState error={error || (t("teams") === "Tim" ? "Gagal memuat data tim" : "Failed to load teams data")} />;
  }

  return (
    <PageTransition className="max-w-7xl mx-auto px-4" style={{ paddingTop: "48px", paddingBottom: "96px" }}>
      <ShimmerStyle />
      {/* Hero */}
      <div style={{ paddingBottom: "32px" }}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className="p-2.5 flex items-center justify-center"
            style={{ backgroundColor: "var(--card)", borderRadius: "10px", border: "1px solid var(--border)" }}
          >
            <Users className="h-5 w-5" style={{ color: "var(--foreground)" }} />
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
              {t("teamsTitle")}
            </h2>
            <p
              style={{
                fontSize: "15px",
                fontWeight: 400,
                color: "var(--muted-foreground)",
                marginTop: "4px",
                letterSpacing: "-0.15px",
              }}
            >
              {t("teamsSubtitle")}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2 flex-1"
            style={{
              backgroundColor: "var(--card)",
              borderRadius: "12px",
              border: "1px solid var(--border)",
            }}
          >
            <Search className="h-4 w-4 shrink-0" style={{ color: "var(--muted-foreground)" }} />
            <input
              type="text"
              placeholder={t("searchTeams")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-sm"
              style={{ color: "var(--foreground)", letterSpacing: "-0.14px" }}
            />
          </div>

          {/* Confederation filter */}
          <div className="flex gap-1.5 flex-wrap sm:flex-nowrap overflow-x-auto sm:overflow-visible pb-1 sm:pb-0">
            <button
              onClick={() => setConfedFilter("")}
              className="px-3 py-1.5 text-xs font-medium transition-all shrink-0"
              style={{
                borderRadius: "100px",
                backgroundColor: !confedFilter ? "var(--primary)" : "var(--card)",
                color: !confedFilter ? "var(--primary-foreground)" : "var(--muted-foreground)",
                border: "1px solid var(--border)",
                letterSpacing: "-0.12px",
              }}
            >
              {t("allConfederations")}
            </button>
            {CONFEDERATIONS.map((c) => (
              <button
                key={c}
                onClick={() => setConfedFilter(c === confedFilter ? "" : c)}
                className="px-3 py-1.5 text-xs font-medium transition-all shrink-0"
                style={{
                  borderRadius: "100px",
                  backgroundColor: confedFilter === c ? "var(--primary)" : "var(--card)",
                  color: confedFilter === c ? "var(--primary-foreground)" : "var(--muted-foreground)",
                  border: "1px solid var(--border)",
                  letterSpacing: "-0.12px",
                }}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Group dropdown */}
          <Select
            value={groupFilter || "__all__"}
            onValueChange={(val) => setGroupFilter(val === "__all__" ? "" : val)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder={t("allGroups")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{t("allGroups")}</SelectItem>
              {GROUPS.map((g) => (
                <SelectItem key={g} value={g}>
                  Group {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <div>
        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-[16px] border border-[var(--border)]"
                style={{ backgroundColor: "var(--card)" }}
              >
                <div className="w-10 h-7 rounded-[4px] shimmer-bg opacity-30 shrink-0" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="w-2/3 h-4 rounded shimmer-bg" />
                  <div className="flex gap-1.5">
                    <div className="w-8 h-3.5 rounded shimmer-bg opacity-40" />
                    <div className="w-12 h-3.5 rounded shimmer-bg opacity-40" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p style={{ color: "var(--muted-foreground)", fontSize: "15px" }}>{t("noTeamsFound")}</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((team) => {
              const flagUrl = getCountryFlagUrl(team.name);
              return (
                <Link
                  key={team.name}
                  href={`/teams/${encodeURIComponent(team.name)}`}
                  className="group flex items-center gap-3 p-4 transition-all hover:scale-[1.02]"
                  style={{
                    backgroundColor: "var(--card)",
                    borderRadius: "16px",
                    border: "1px solid var(--border)",
                  }}
                >
                  {/* Flag */}
                  <div
                    className="shrink-0 overflow-hidden"
                    style={{
                      width: "40px",
                      height: "28px",
                      borderRadius: "4px",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {flagUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={flagUrl}
                        alt={team.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg" style={{ backgroundColor: "var(--muted)" }}>
                        {team.flag_icon}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate font-semibold group-hover:underline"
                      style={{
                        fontSize: "14px",
                        color: "var(--foreground)",
                        letterSpacing: "-0.14px",
                      }}
                    >
                      {team.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: "4px",
                          backgroundColor: "var(--primary)",
                          color: "var(--primary-foreground)",
                        }}
                      >
                        {team.fifa_code}
                      </span>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          padding: "1px 6px",
                          borderRadius: "4px",
                          backgroundColor: "var(--muted)",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        Grp {team.group}
                      </span>
                    </div>
                  </div>

                  {/* Confederation */}
                  <div className="shrink-0">
                    <Globe className="h-3.5 w-3.5" style={{ color: "var(--muted-foreground)" }} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Stats footer */}
        <div
          className="mt-6 flex items-center justify-center gap-6 text-xs"
          style={{ color: "var(--muted-foreground)" }}
        >
          <span>{teams.length} teams</span>
          <span>12 groups</span>
          <span>{CONFEDERATIONS.length} confederations</span>
        </div>
      </div>
    </PageTransition>
  );
}
