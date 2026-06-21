"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Trophy, ArrowLeft } from "lucide-react";
import { MatchCard } from "@/components/match/match-card";
import { WorldCupData } from "@/lib/types";
import { PageTransition } from "@/components/layout/page-transition";
import { getMatchStartTimeMs } from "@/lib/data";

export default function GroupMatchesPage() {
  const params = useParams();
  const router = useRouter();
  const groupNameRaw = params?.name as string;
  const groupName = groupNameRaw ? decodeURIComponent(groupNameRaw) : "";

  const [data, setData] = useState<WorldCupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const groupMatches = useMemo(() => {
    if (!data || !groupName) return [];
    return data.matches
      .filter((m) => m.group === groupName)
      .sort((a, b) => getMatchStartTimeMs(a) - getMatchStartTimeMs(b));
  }, [data, groupName]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: "var(--foreground)" }} />
        <p style={{ color: "var(--muted-foreground)", fontSize: "14px", fontWeight: 500, letterSpacing: "-0.14px" }}>
          Loading group matches...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        className="text-center py-24 max-w-lg mx-auto"
        style={{ backgroundColor: "var(--card)", borderRadius: "20px", border: "1px solid var(--border)" }}
      >
        <p style={{ color: "#ef4444", fontSize: "14px", fontWeight: 700, letterSpacing: "-0.8px", marginBottom: "8px" }}>
          Sync Error
        </p>
        <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginBottom: "16px" }}>{error || "Failed to load data"}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Try Again</button>
      </div>
    );
  }

  return (
    <PageTransition className="max-w-7xl mx-auto px-4" style={{ paddingBottom: "96px" }}>
      <div className="space-y-12">
        {/* Back button */}
        <button
          onClick={() => router.push("/standing")}
          className="btn-secondary"
          style={{ gap: "8px", fontSize: "14px" }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Standings</span>
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 flex items-center justify-center"
            style={{ backgroundColor: "var(--card)", borderRadius: "10px", border: "1px solid var(--border)" }}
          >
            <Trophy className="h-5 w-5" style={{ color: "var(--foreground)" }} />
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
              {groupName} Match List
            </h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "15px", fontWeight: 400, letterSpacing: "-0.15px", marginTop: "4px" }}>
              Showing matches scheduled and played specifically in {groupName} during the group stage.
            </p>
          </div>
        </div>

        {groupMatches.length === 0 ? (
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
            No matches found for this group.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {groupMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
