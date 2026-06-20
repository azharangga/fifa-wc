"use client";

import { useMemo } from "react";
import { LayoutGrid } from "lucide-react";
import { GroupTable } from "@/components/standing/group-table";
import { organizeGroups } from "@/lib/data";
import { PageTransition } from "@/components/layout/page-transition";
import { ThirdPlaceRanking } from "@/components/standing/third-place-ranking";
import { useWorldCupData } from "@/hooks/use-world-cup-data";
import { LoadingState } from "@/components/layout/loading-state";
import { ErrorState } from "@/components/layout/error-state";
import { useTranslation } from "@/components/layout/language-provider";

export default function GroupsPage() {
  const { data, loading, error } = useWorldCupData();
  const { t } = useTranslation();

  const groups = useMemo(() => (data ? organizeGroups(data.matches) : []), [data]);

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

  if (loading) {
    return <LoadingState message={t("home") === "Beranda" ? "Memuat klasemen grup..." : "Loading group standings..."} />;
  }

  if (error || !data) {
    return <ErrorState error={error || (t("home") === "Beranda" ? "Gagal memuat data" : "Failed to load data")} />;
  }

  return (
    <PageTransition className="max-w-6xl mx-auto px-4" style={{ paddingTop: "48px", paddingBottom: "96px" }}>
      <div className="space-y-12">
        {/* Page header */}
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 flex items-center justify-center"
            style={{ backgroundColor: "var(--card)", borderRadius: "10px", border: "1px solid var(--border)" }}
          >
            <LayoutGrid className="h-5 w-5" style={{ color: "var(--foreground)" }} />
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
              {t("groupsTitle")}
            </h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "15px", fontWeight: 400, letterSpacing: "-0.15px", marginTop: "4px" }}>
              {t("groupsSubtitle")}
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
          {groups.map((group) => (
            <div
              key={group.name}
              id={`group-${group.name.replace("Group ", "").toLowerCase()}`}
              className="scroll-mt-24"
            >
              <GroupTable
                group={group}
                qualifyingThirds={qualifyingThirdNames}
              />
            </div>
          ))}
        </div>

        <ThirdPlaceRanking thirdPlaceStandings={thirdPlaceStandings} />
      </div>
    </PageTransition>
  );
}