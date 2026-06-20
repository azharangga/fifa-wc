"use client";

import { useEffect, useState, use } from "react";
import { Loader2, ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { HLSPlayer } from "@/components/match/hls-player";
import { Badge } from "@/components/ui/badge";
import { WorldCupData } from "@/lib/types";
import { formatDate, convertTimeToUserTimezone, getMatchStatus } from "@/lib/data";
import { PageTransition } from "@/components/layout/page-transition";
import { MatchGoalsLog } from "@/components/match/match-goals-log";
import { ChannelSelector, StreamChannel } from "@/components/match/channel-selector";
import { MatchScoreCard } from "@/components/match/match-score-card";
import { useTranslation } from "@/components/layout/language-provider";

const STREAM_CHANNELS: StreamChannel[] = [
  { id: "rtbgo", name: "RTB Go", quality: "HD 720p", url: "https://d1211whpimeups.cloudfront.net/smil:rtbgo/chunklist_b4096000_slENG.m3u8" },
  { id: "rtb2", name: "RTB 2", quality: "HD 720p", url: "https://d1211whpimeups.cloudfront.net/smil:rtb2/playlist.m3u8" },
  { id: "vtv3", name: "VTV3", quality: "HD", url: "https://live.fptplay53.net/live/media/vtv3/live247-hls-avc/index.m3u8" },
  { id: "vtv6", name: "VTV6", quality: "HD", url: "https://live-a.fptplay53.net/live/media/vtv6/live247-hls-avc/index.m3u8" },
];

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<WorldCupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<StreamChannel>(STREAM_CHANNELS[0]);
  const { t, lang } = useTranslation();

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

  const match = data?.matches.find((m) => m.id === id);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 className="h-10 w-10 animate-spin" style={{ color: "var(--foreground)" }} />
        <p style={{ color: "var(--muted-foreground)", fontSize: "14px", fontWeight: 500, letterSpacing: "-0.14px" }}>
          {t("connectingLiveLines")}
        </p>
      </div>
    );
  }

  if (error || !data || !match) {
    return (
      <div
        className="text-center py-24 max-w-lg mx-auto space-y-4"
        style={{ backgroundColor: "var(--card)", borderRadius: "20px", border: "1px solid var(--border)" }}
      >
        <p style={{ color: "#ef4444", fontSize: "14px", fontWeight: 700, letterSpacing: "-0.8px" }}>{t("syncError")}</p>
        <p style={{ color: "var(--muted-foreground)", fontSize: "13px" }}>{error || t("matchNotFound")}</p>
        <Link href="/" style={{ color: "var(--foreground)", fontSize: "13px", fontWeight: 500 }} className="hover:underline inline-flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" /> {t("backToHome")}
        </Link>
      </div>
    );
  }

  const status = getMatchStatus(match);

  return (
    <PageTransition className="max-w-6xl mx-auto px-4" style={{ paddingTop: "48px", paddingBottom: "96px" }}>
      <div className="space-y-8">
        {/* Top row: back + badges */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Link href="/" className="btn-secondary" style={{ gap: "6px", padding: "8px 14px" }}>
            <ArrowLeft className="h-4 w-4" />
            <span>{t("backToHome")}</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            {match.matchNumber && (
              <Badge style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", backgroundColor: "var(--foreground)", color: "var(--background)" }}>
                {t("matchNumberText", { matchNumber: match.matchNumber.toString() })}
              </Badge>
            )}
            {status === "live" && (
              <Badge style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", backgroundColor: "#ef4444", color: "#ffffff", animation: "pulse 2s infinite" }}>
                {t("liveNow")}
              </Badge>
            )}
            {status === "completed" && (
              <Badge style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", backgroundColor: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)" }}>
                {t("fullTime")}
              </Badge>
            )}
            {status === "upcoming" && (
              <Badge style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.08)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>
                {t("upcoming")}
              </Badge>
            )}
            {match.group && (
              <Badge style={{ fontSize: "10px", fontWeight: 500, padding: "2px 8px", borderRadius: "6px", backgroundColor: "var(--card)", color: "var(--muted-foreground)", border: "1px solid var(--border)" }}>
                {match.group.startsWith("Group") ? match.group.replace("Group", t("group")) : match.group}
              </Badge>
            )}
            <Badge style={{ fontSize: "10px", fontWeight: 500, padding: "2px 8px", borderRadius: "6px", backgroundColor: "var(--card)", color: "var(--muted-foreground)", border: "1px solid var(--border)", gap: "4px" }}>
              <Calendar className="h-3 w-3" />
              {match.time ? (() => {
                const converted = convertTimeToUserTimezone(match.date, match.time, lang);
                return (
                  <>
                    <span>{converted.date}</span>
                    {converted.dateShifted && (
                      <span style={{ fontSize: "8px", fontWeight: 700, padding: "1px 4px", borderRadius: "4px", backgroundColor: "rgba(245,158,11,0.15)", color: "#f59e0b", marginLeft: "2px" }}>
                        {lang === "id" ? "+1 hari" : "next day"}
                      </span>
                    )}
                  </>
                );
              })() : <span>{formatDate(match.date, lang)}</span>}
            </Badge>
            {match.time && (() => {
              const converted = convertTimeToUserTimezone(match.date, match.time, lang);
              return (
                <Badge style={{ fontSize: "10px", fontWeight: 500, padding: "2px 8px", borderRadius: "6px", backgroundColor: "var(--card)", color: "var(--muted-foreground)", border: "1px solid var(--border)", gap: "4px" }}>
                  <Clock className="h-3 w-3" />
                  <span>{converted.time}</span>
                </Badge>
              );
            })()}
          </div>
        </div>

        {/* Player */}
        <div style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
          <HLSPlayer url={selectedChannel.url} channelId={selectedChannel.id} venue={match.ground} />
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left col */}
          <div className="lg:col-span-2 space-y-6">
            <MatchScoreCard match={match} />
            <ChannelSelector
              channels={STREAM_CHANNELS}
              selectedChannel={selectedChannel}
              onSelectChannel={setSelectedChannel}
            />
          </div>

          {/* Right col */}
          <div className="space-y-6">
            {/* Venue */}
             {match.ground && (
              <div style={{ backgroundColor: "var(--card)", borderRadius: "20px", border: "1px solid var(--border)", overflow: "hidden" }}>
                <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--hairline-soft)", backgroundColor: "var(--card-muted)" }}>
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {t("stadiumVenue")}
                  </p>
                </div>
                <div style={{ padding: "16px" }} className="flex items-start gap-3">
                  <div
                    className="p-2.5 shrink-0 flex items-center justify-center"
                    style={{ borderRadius: "12px", backgroundColor: "var(--secondary)" }}
                  >
                    <MapPin className="h-4 w-4" style={{ color: "var(--muted-foreground)" }} />
                  </div>
                  <div className="min-w-0">
                    <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.14px" }} className="truncate">
                      {match.ground}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--muted-foreground)", marginTop: "2px" }}>
                      {match.hostCity ? `${match.hostCity}, ${t("tournamentArena")}` : t("tournamentArena")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {match.matchUrl && (
              <div style={{ backgroundColor: "var(--card)", borderRadius: "20px", border: "1px solid var(--border)", overflow: "hidden", padding: "16px" }}>
                <a
                  href={match.matchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full text-center inline-flex items-center justify-center gap-1.5"
                  style={{ fontSize: "13px", padding: "10px" }}
                >
                  <span>{t("officialMatchCenter")}</span>
                  <span>→</span>
                </a>
              </div>
            )}

            <MatchGoalsLog match={match} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

