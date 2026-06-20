"use client";

import { useEffect, useState, useMemo } from "react";
import { Trophy } from "lucide-react";
import { WorldCupData } from "@/lib/types";
import { organizeKnockout } from "@/lib/data";
import { PageTransition } from "@/components/layout/page-transition";
import { KnockoutBracket } from "@/components/knockout/knockout-bracket";
import { LoadingState } from "@/components/layout/loading-state";
import { ErrorState } from "@/components/layout/error-state";
import { useTranslation } from "@/components/layout/language-provider";

export default function KnockoutPage() {
  const [data, setData] = useState<WorldCupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const isId = t("home") === "Beranda";

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

  const knockouts = useMemo(() => (data ? organizeKnockout(data.matches) : []), [data]);

  if (error || (!loading && !data)) {
    return <ErrorState error={error || (isId ? "Gagal memuat data" : "Failed to load data")} />;
  }

  return (
    <PageTransition className="max-w-7xl mx-auto px-4" style={{ paddingTop: "48px", paddingBottom: "96px" }}>
      <div className="space-y-12">
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
              {t("knockoutTitle")}
            </h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "15px", fontWeight: 400, letterSpacing: "-0.15px", marginTop: "4px" }}>
              {t("knockoutSubtitle")}
            </p>
          </div>
        </div>

        <KnockoutBracket knockouts={knockouts} loading={loading} />
      </div>
    </PageTransition>
  );
}

