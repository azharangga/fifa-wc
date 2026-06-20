"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Calendar, ArrowLeft } from "lucide-react";
import { MatchCard } from "@/components/match/match-card";
import { WorldCupData } from "@/lib/types";
import { formatDate } from "@/lib/data";
import { PageTransition } from "@/components/layout/page-transition";
import { useTranslation } from "@/components/layout/language-provider";

export default function DateSchedulePage() {
  const params = useParams();
  const router = useRouter();
  const dateStr = params?.date as string;

  const [data, setData] = useState<WorldCupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

  const dayMatches = useMemo(() => {
    if (!data || !dateStr) return [];
    return data.matches.filter((m) => m.date === dateStr);
  }, [data, dateStr]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: "var(--foreground)" }} />
        <p style={{ color: "var(--muted-foreground)", fontSize: "14px", fontWeight: 500, letterSpacing: "-0.14px" }}>
          {isId ? "Memuat jadwal harian..." : "Loading day schedule..."}
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
          {isId ? "Kesalahan Sinkronisasi" : "Sync Error"}
        </p>
        <p style={{ color: "var(--muted-foreground)", fontSize: "13px", marginBottom: "16px" }}>{error || (isId ? "Gagal memuat data" : "Failed to load data")}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">{isId ? "Coba Lagi" : "Try Again"}</button>
      </div>
    );
  }

  const formattedDate = dateStr ? formatDate(dateStr, lang) : (isId ? "Tanggal Terpilih" : "Selected Date");

  return (
    <PageTransition className="max-w-6xl mx-auto px-4" style={{ paddingTop: "48px", paddingBottom: "96px" }}>
      <div className="space-y-12">
        {/* Back button */}
        <button onClick={() => router.push("/schedule")} className="btn-secondary" style={{ gap: "8px" }}>
          <ArrowLeft className="h-4 w-4" />
          <span>{isId ? "Kembali ke Kalender Jadwal" : "Back to Schedule Calendar"}</span>
        </button>

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
              {isId ? `Pertandingan pada ${formattedDate}` : `Matches on ${formattedDate}`}
            </h2>
            <p style={{ color: "var(--muted-foreground)", fontSize: "15px", fontWeight: 400, letterSpacing: "-0.15px", marginTop: "4px" }}>
              {isId 
                ? `Menampilkan semua ${dayMatches.length} pertandingan yang dijadwalkan untuk tanggal turnamen ini.`
                : `Showing all ${dayMatches.length} match${dayMatches.length > 1 ? "es" : ""} scheduled for this tournament date.`
              }
            </p>
          </div>
        </div>

        {dayMatches.length === 0 ? (
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
            {isId ? "Tidak ada pertandingan yang dijadwalkan untuk tanggal ini." : "No matches scheduled for this date."}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {dayMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
