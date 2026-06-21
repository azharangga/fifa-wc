"use client";

import { useState, use, useEffect } from "react";
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

import { MatchDetailSkeleton } from "@/components/layout/loading-state";

const STREAM_CHANNELS: StreamChannel[] = [
  { id: "rtbgo", name: "RTB Go", quality: "HD 1080p", url: process.env.NEXT_PUBLIC_STREAM_URL_RTBGO || "https://d1211whpimeups.cloudfront.net/smil:rtbgo/chunklist_b4096000_slENG.m3u8" },
  { id: "tvri", name: "TVRI Nasional", quality: "HD 1080p", url: process.env.NEXT_PUBLIC_STREAM_URL_TVRI || "https://ott-balancer.tvri.go.id/live/eds/Nasional/hls/Nasional.m3u8" },
  { id: "rtb1", name: "RTB 1", quality: "HD 1080p", url: process.env.NEXT_PUBLIC_STREAM_URL_RTB1 || "https://d1211whpimeups.cloudfront.net/smil:rtb1/playlist.m3u8" },
  { id: "rtb2", name: "RTB 2", quality: "HD 1080p", url: process.env.NEXT_PUBLIC_STREAM_URL_RTB2 || "https://d1211whpimeups.cloudfront.net/smil:rtb2/playlist.m3u8" },
  { id: "vtv3", name: "VTV3", quality: "HD 1080p", url: process.env.NEXT_PUBLIC_STREAM_URL_VTV3 || "https://live.fptplay53.net/live/media/vtv3/live247-hls-avc/index.m3u8" },
  { id: "vtv6", name: "VTV6", quality: "HD 1080p", url: process.env.NEXT_PUBLIC_STREAM_URL_VTV6 || "https://live-a.fptplay53.net/live/media/vtv6/live247-hls-avc/index.m3u8" },
];

import { useWorldCupData } from "@/hooks/use-world-cup-data";

export default function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, loading, error } = useWorldCupData();
  const [selectedChannel, setSelectedChannel] = useState<StreamChannel>(STREAM_CHANNELS[0]);
  const [currentResolution, setCurrentResolution] = useState<string>("HD");
  const { t, lang } = useTranslation();

  useEffect(() => {
    setCurrentResolution("HD");
  }, [selectedChannel]);

  const match = data?.matches.find((m) => m.id === id);

  if (loading) {
    return <MatchDetailSkeleton />;
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
    <PageTransition className="max-w-7xl mx-auto px-4" style={{ paddingTop: "48px", paddingBottom: "96px" }}>
      <div className="space-y-8">
        {/* Top row: back + badges */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Link href="/" className="btn-secondary" style={{ gap: "6px", padding: "8px 14px" }}>
            <ArrowLeft className="h-4 w-4" />
            <span>{t("backToHome")}</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap overflow-hidden">
            {match.matchNumber && (
              <Badge style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", backgroundColor: "var(--foreground)", color: "var(--background)" }}>
                {t("matchNumberText", { matchNumber: match.matchNumber.toString() })}
              </Badge>
            )}
            {status === "live" && (
              <Badge style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", backgroundColor: "#ef4444", color: "#ffffff" }}>
                {t("liveNow")}
              </Badge>
            )}
            {status === "completed" && (
              <Badge style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", backgroundColor: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.25)" }}>
                {t("fullTime")}
              </Badge>
            )}
            {status === "upcoming" && (
              <Badge style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "6px", backgroundColor: "#ffffff", color: "#000000", border: "none" }}>
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
        <div className="rounded-[20px] overflow-hidden shadow-2xl">
          <HLSPlayer
            url={selectedChannel.url}
            channelId={selectedChannel.id}
            channelName={selectedChannel.name}
            onResolutionChange={setCurrentResolution}
          />
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
              currentResolution={currentResolution}
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

