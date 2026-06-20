"use client";

import Link from "next/link";
import { Calendar, Clock, MapPin, Play, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Match } from "@/lib/types";
import {
  formatDate,
  getMatchStatus,
  getCountryFlagUrl,
  convertTimeToUserTimezone,
  getStadiumImage,
} from "@/lib/data";
import { useTranslation } from "../layout/language-provider";

export function MatchCard({ match }: { match: Match }) {
  const status = getMatchStatus(match);
  const { t, lang } = useTranslation();
  const isId = lang === "id";

  const flag1 = getCountryFlagUrl(match.team1);
  const flag2 = getCountryFlagUrl(match.team2);

  const hasGoals =
    match.goals1 && match.goals2 && (match.goals1.length > 0 || match.goals2.length > 0);

  const stadiumImage = getStadiumImage(match.ground);

  return (
    <div
      className={`overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-0.5 ${
        status === "live" ? "live-card-glow" : ""
      }`}
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "20px", /* xl */
      }}
    >
      {/* Banner area */}
      <div
        className="relative aspect-[2/1] w-full flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: "#090909", borderBottom: "1px solid #1a1a1a" }}
      >
        {/* Stadium background photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={stadiumImage}
          alt={match.ground || "Stadium"}
          className="absolute inset-0 w-full h-full object-cover brightness-[0.35] select-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/50 z-10" />

        {/* Top bar: Venue + Status */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between">
          {match.ground ? (
            <div className="flex items-center gap-1 min-w-0 mr-2" style={{ color: "#999999", fontSize: "10px", fontWeight: 500, lineHeight: "1" }}>
              <MapPin className="h-3 w-3 shrink-0" style={{ display: "block" }} />
              <span className="truncate" style={{ lineHeight: "1" }}>
                {match.matchNumber ? `Match ${match.matchNumber} • ` : ""}
                {match.ground}
                {match.hostCity ? `, ${match.hostCity}` : ""}
              </span>
            </div>
          ) : (
            <div />
          )}
          <div className="shrink-0 flex items-center">
            {status === "live" && (
              <Badge
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  padding: "3px 8px 3px 8px",
                  lineHeight: "1",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "6px",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
                }}
              >
                {t("live").toUpperCase()}
              </Badge>
            )}
            {status === "completed" && (
              <Badge
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  padding: "3px 8px 3px 8px",
                  lineHeight: "1",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "6px",
                  backgroundColor: "#22c55e", /* semantic-success */
                  color: "#000000",
                }}
              >
                {t("ft").toUpperCase()}
              </Badge>
            )}
            {status === "upcoming" && (
              <Badge
                style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  padding: "3px 8px 3px 8px",
                  lineHeight: "1",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "6px",
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  border: "none",
                }}
              >
                {isId ? "MENDATANG" : "UPCOMING"}
              </Badge>
            )}
          </div>
        </div>

        {/* Teams + Score */}
        <div className="relative z-20 flex items-center justify-center gap-4 w-full px-3">
          {/* Team 1 */}
          <div className="flex flex-col items-center gap-1.5 flex-1 text-center">
            <div
              className="h-9 w-13 sm:h-10 sm:w-15 overflow-hidden flex items-center justify-center shrink-0"
              style={{ borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(0,0,0,0.2)" }}
            >
              {flag1 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={flag1} alt={match.team1} className="w-full h-full object-cover select-none" />
              ) : (
                <Trophy className="h-5 w-5" style={{ color: "rgba(255,255,255,0.4)" }} />
              )}
            </div>
            <span
              className="line-clamp-1"
              style={{ color: "#ffffff", fontSize: "13px", fontWeight: 700, letterSpacing: "-0.13px" }}
            >
              {match.team1}
            </span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center justify-center shrink-0 min-w-[50px]">
            {match.score?.ft ? (
              <div
                style={{
                  color: "#ffffff",
                  fontSize: "clamp(1.25rem, 3vw, 1.5rem)",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {match.score.ft[0]}-{match.score.ft[1]}
              </div>
            ) : (
              <div
                className="p-2 flex items-center justify-center transition-all duration-300"
                style={{
                  borderRadius: "9999px", /* full */
                  backgroundColor: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <Play className="h-4 w-4 fill-white text-white translate-x-0.5" />
              </div>
            )}
          </div>

          {/* Team 2 */}
          <div className="flex flex-col items-center gap-1.5 flex-1 text-center">
            <div
              className="h-9 w-13 sm:h-10 sm:w-15 overflow-hidden flex items-center justify-center shrink-0"
              style={{ borderRadius: "10px", border: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(0,0,0,0.2)" }}
            >
              {flag2 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={flag2} alt={match.team2} className="w-full h-full object-cover select-none" />
              ) : (
                <Trophy className="h-5 w-5" style={{ color: "rgba(255,255,255,0.4)" }} />
              )}
            </div>
            <span
              className="line-clamp-1"
              style={{ color: "#ffffff", fontSize: "13px", fontWeight: 700, letterSpacing: "-0.13px" }}
            >
              {match.team2}
            </span>
          </div>
        </div>

        {/* Full-card link */}
        <Link href={`/match/${match.id}`} className="absolute inset-0 z-10" />
      </div>

      {/* Footer */}
      <div
        className="p-3 flex items-center justify-between text-xs mt-auto"
        style={{ backgroundColor: "var(--card)" }}
      >
      <div className="flex items-center gap-1.5" style={{ color: "var(--muted-foreground)", fontSize: "13px", fontWeight: 500, letterSpacing: "-0.13px" }}>
          <Calendar className="h-3.5 w-3.5" />
          {(() => {
            if (match.time) {
              const converted = convertTimeToUserTimezone(match.date, match.time, lang);
              return (
                <>
                  <span>{converted.date}</span>
                  {converted.dateShifted && (
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
                  <span style={{ opacity: 0.6 }}>•</span>
                  <Clock className="h-3.5 w-3.5" />
                  <span>{converted.time}</span>
                </>
              );
            }
            return <span>{formatDate(match.date, lang)}</span>;
          })()}
        </div>

        <Link
          href={`/match/${match.id}`}
          className="inline-flex items-center justify-center shrink-0"
          style={{
            backgroundColor: "var(--foreground)",
            color: "var(--background)",
            borderRadius: "100px",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "-0.14px",
            height: "28px",
            padding: "0 14px",
          }}
        >
          <span>{status === "completed" ? (isId ? "Detail" : "Details") : (isId ? "Tonton" : "Watch")}</span>
        </Link>
      </div>

      {/* Goal Details Modal */}
      {hasGoals && (
        <div style={{ borderTop: "1px solid var(--hairline-soft)" }} className="mt-auto py-2.5 text-center bg-card-muted">
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground underline cursor-pointer transition-colors"
              >
                {isId ? "Detail gol" : "Goal details"}
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base font-semibold flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span>{isId ? "Detail Gol" : "Goal Details"}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="py-2 space-y-4">
                {match.goals1 && match.goals1.length > 0 && (
                  <div className="space-y-2">
                    <div
                      className="flex items-center gap-1.5"
                      style={{ fontSize: "12px", fontWeight: 700, color: "var(--foreground)" }}
                    >
                      {flag1 && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={flag1} alt={match.team1} className="w-4 h-2.5 rounded-sm object-cover select-none" />
                      )}
                      <span>{match.team1}</span>
                    </div>
                    {match.goals1.map((g, i) => (
                      <div key={`g1-${i}`} className="flex items-center gap-2 ml-2" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 200 200" fill="none" stroke="currentColor">
                          <circle cx="100" cy="100" r="90" strokeWidth="12" />
                          <polygon points="100,50 143,82 127,133 73,133 57,82" fill="currentColor" />
                          <path d="M100,50 L100,20 M143,82 L175,70 M127,133 L150,170 M73,133 L50,170 M57,82 L25,70" strokeWidth="12" strokeLinecap="round" />
                        </svg>
                        <span style={{ fontWeight: 700, color: "var(--foreground)" }}>{g.name}</span>
                        <span>{g.minute}&apos;</span>
                        {g.penalty && (
                          <Badge
                            variant="outline"
                            style={{ fontSize: "8px", padding: "0 4px", height: "14px", borderRadius: "4px", borderColor: "rgba(245,158,11,0.3)", color: "#f59e0b", fontWeight: 700 }}
                          >
                            {isId ? "PEN" : "PEN"}
                          </Badge>
                        )}
                        {g.owngoal && (
                          <Badge
                            variant="outline"
                            style={{ fontSize: "8px", padding: "0 4px", height: "14px", borderRadius: "4px", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444", fontWeight: 700 }}
                          >
                            {isId ? "GBD" : "OG"}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {match.goals2 && match.goals2.length > 0 && (
                  <div className="space-y-2">
                    <div
                      className="flex items-center gap-1.5"
                      style={{ fontSize: "12px", fontWeight: 700, color: "var(--foreground)" }}
                    >
                      {flag2 && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={flag2} alt={match.team2} className="w-4 h-2.5 rounded-sm object-cover select-none" />
                      )}
                      <span>{match.team2}</span>
                    </div>
                    {match.goals2.map((g, i) => (
                      <div key={`g2-${i}`} className="flex items-center gap-2 ml-2" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 200 200" fill="none" stroke="currentColor">
                          <circle cx="100" cy="100" r="90" strokeWidth="12" />
                          <polygon points="100,50 143,82 127,133 73,133 57,82" fill="currentColor" />
                          <path d="M100,50 L100,20 M143,82 L175,70 M127,133 L150,170 M73,133 L50,170 M57,82 L25,70" strokeWidth="12" strokeLinecap="round" />
                        </svg>
                        <span style={{ fontWeight: 700, color: "var(--foreground)" }}>{g.name}</span>
                        <span>{g.minute}&apos;</span>
                        {g.penalty && (
                          <Badge
                            variant="outline"
                            style={{ fontSize: "8px", padding: "0 4px", height: "14px", borderRadius: "4px", borderColor: "rgba(245,158,11,0.3)", color: "#f59e0b", fontWeight: 700 }}
                          >
                            {isId ? "PEN" : "PEN"}
                          </Badge>
                        )}
                        {g.owngoal && (
                          <Badge
                            variant="outline"
                            style={{ fontSize: "8px", padding: "0 4px", height: "14px", borderRadius: "4px", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444", fontWeight: 700 }}
                          >
                            {isId ? "GBD" : "OG"}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}