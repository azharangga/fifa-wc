"use client";

import { useEffect, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Play, Calendar, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Match, WorldCupData } from "@/lib/types";
import { getCountryFlagUrl, formatDate, convertTimeToUserTimezone, getMatchStatus, getStadiumImage } from "@/lib/data";
import { useTranslation } from "../layout/language-provider";

interface CarouselSlide {
  type: string;
  badge: string;
  badgeColor: string;
  image: string;
  round: string;
  actionUrl: string;
  actionText: string;
  match?: Match;
  title?: string;
  description?: string;
}

export function HomeCarousel({ data }: { data: WorldCupData }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t, lang } = useTranslation();

  const slides = useMemo(() => {
    if (!data) return [];
    const upcoming = data.matches
      .filter((m) => getMatchStatus(m) === "upcoming")
      .sort((a, b) => {
        const dateDiff = a.date.localeCompare(b.date);
        if (dateDiff !== 0) return dateDiff;
        return (a.time || "").localeCompare(b.time || "");
      });

    const isId = t("home") === "Beranda";

    const list: CarouselSlide[] = [];
    const maxMatches = Math.min(upcoming.length, 5);
    for (let i = 0; i < maxMatches; i++) {
      const m = upcoming[i];
      list.push({
        type: "match",
        badge: isId ? "SIARAN MENDATANG" : "UPCOMING STREAM",
        badgeColor: "bg-white/10 text-white border border-white/20",
        match: m,
        image: getStadiumImage(m.ground),
        round: m.round,
        actionUrl: `/match/${m.id}`,
        actionText: isId ? "Tonton Siaran Langsung" : "View Live Stream",
      });
    }

    const infoSlides = [
      {
        type: "info",
        badge: isId ? "INFO TURNAMEN" : "TOURNAMENT INFO",
        badgeColor: "bg-white/10 text-white border border-white/20",
        title: isId ? "Piala Dunia Bersama 2026" : "United 2026 World Cup",
        description: isId 
          ? "48 Tim. 3 Negara Tuan Rumah. 16 Kota Penyelenggara. Ikuti setiap siaran langsung HLS definisi tinggi." 
          : "48 Teams. 3 Host Nations. 16 Host Cities. Follow every HLS high-definition live stream on our hub.",
        image: "/images/stadium_night.png",
        round: "FIFA WORLD CUP 2026",
        actionUrl: "/schedule",
        actionText: isId ? "Lihat Jadwal Lengkap" : "View Full Schedule",
      },
      {
        type: "info",
        badge: isId ? "SIARAN LANGSUNG" : "LIVE BROADCASTS",
        badgeColor: "bg-white/10 text-white border border-white/20",
        title: isId ? "Tonton Semua Laga Langsung" : "Watch All Matches Live",
        description: isId 
          ? "Mitra penyiaran resmi RTB Go, RTB 2, VTV3 HD, dan VTV6 HD. Pemutar web gratis definisi tinggi." 
          : "Official streaming partners RTB Go, RTB 2, VTV3 HD, and VTV6 HD. Free high-definition web player.",
        image: "/images/stadium_aerial.png",
        round: isId ? "JARINGAN MITRA" : "PARTNER NETWORKS",
        actionUrl: "/standing",
        actionText: isId ? "Periksa Klasemen" : "Check Standings",
      },
    ];

    let infoIdx = 0;
    while (list.length < 5 && infoIdx < infoSlides.length) {
      list.push(infoSlides[infoIdx]);
      infoIdx++;
    }
    return list;
  }, [data, t]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <div
      className="relative w-full h-[65vh] sm:h-[75vh] md:h-[calc(100vh-64px)] min-h-[400px] overflow-hidden"
      style={{ backgroundColor: "#090909", borderBottom: "1px solid #262626" }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title || "Stadium"}
            className="absolute inset-0 w-full h-full object-cover select-none object-center brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/60 z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-transparent to-transparent z-10 hidden sm:block" />
 
          <div className="absolute inset-0 z-20 flex items-center justify-start">
            <div className="max-w-7xl mx-auto w-full px-4">
              {slides[currentSlide].type === "match" && slides[currentSlide].match ? (
                <div className="space-y-4 sm:space-y-5 text-left max-w-3xl">
                  {/* Badges row */}
                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <Badge
                      className="select-none uppercase"
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        padding: "2px 10px",
                        borderRadius: "6px",
                        backgroundColor: "#ffffff",
                        color: "#000000",
                        border: "none",
                      }}
                    >
                      {t("home") === "Beranda" ? "MENDATANG" : "UPCOMING"}
                    </Badge>
                    <Badge
                      className="select-none uppercase"
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        padding: "2px 10px",
                        borderRadius: "6px",
                        backgroundColor: "rgba(255,255,255,0.1)",
                        color: "#ffffff",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      {slides[currentSlide].match.round}
                    </Badge>

                    {/* Overlapping Flags */}
                    <div className="flex items-center -space-x-1.5 select-none shrink-0">
                      {getCountryFlagUrl(slides[currentSlide].match.team1) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getCountryFlagUrl(slides[currentSlide].match.team1)}
                          alt={slides[currentSlide].match.team1}
                          className="w-6 h-4 object-cover rounded-sm border border-white/20 shadow-sm z-10"
                        />
                      )}
                      {getCountryFlagUrl(slides[currentSlide].match.team2) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getCountryFlagUrl(slides[currentSlide].match.team2)}
                          alt={slides[currentSlide].match.team2}
                          className="w-6 h-4 object-cover rounded-sm border border-white/20 shadow-sm z-0"
                        />
                      )}
                    </div>
                  </div>

                  <h1
                    className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 tracking-[-1px] sm:tracking-[-4.25px]"
                    style={{
                      fontSize: "clamp(1.75rem, 5.5vw, 5.3125rem)",
                      fontWeight: 500,
                      lineHeight: 0.95,
                      color: "#ffffff",
                    }}
                  >
                    <span>{slides[currentSlide].match.team1}</span>
                    <span
                      style={{
                        color: "rgba(255,255,255,0.25)",
                        fontSize: "clamp(1rem, 3vw, 2.5rem)",
                        fontWeight: 400,
                        letterSpacing: "0",
                      }}
                      className="select-none px-1 lowercase"
                    >
                      vs
                    </span>
                    <span>{slides[currentSlide].match.team2}</span>
                  </h1>

                  {/* Metadata row */}
                  <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 select-none">
                    {slides[currentSlide].match.ground && (
                      <span
                        className="flex items-center gap-1.5"
                        style={{ color: "#cccccc", fontSize: "14px", fontWeight: 500, letterSpacing: "-0.14px" }}
                      >
                        <MapPin className="h-4 w-4" style={{ color: "#999999" }} />
                        <span>{slides[currentSlide].match.ground}</span>
                      </span>
                    )}
                    <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 700 }}>•</span>
                    <span
                      className="flex items-center gap-1.5"
                      style={{ color: "#cccccc", fontSize: "14px", fontWeight: 500, letterSpacing: "-0.14px" }}
                    >
                      <Calendar className="h-4 w-4" style={{ color: "#999999" }} />
                      {slides[currentSlide].match.time ? (() => {
                        const converted = convertTimeToUserTimezone(slides[currentSlide].match.date, slides[currentSlide].match.time!, lang);
                        return (
                          <>
                            <span>{converted.date}</span>
                            {converted.dateShifted && (
                              <span style={{ fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: "5px", backgroundColor: "rgba(245,158,11,0.2)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
                                {lang === "id" ? "+1 hari" : "next day"}
                              </span>
                            )}
                          </>
                        );
                      })() : <span>{formatDate(slides[currentSlide].match.date, lang)}</span>}
                    </span>
                    {slides[currentSlide].match.time && (() => {
                      const converted = convertTimeToUserTimezone(slides[currentSlide].match.date, slides[currentSlide].match.time!, lang);
                      return (
                        <>
                          <span style={{ color: "rgba(255,255,255,0.2)", fontWeight: 700 }}>•</span>
                          <span
                            className="flex items-center gap-1.5"
                            style={{ color: "#cccccc", fontSize: "14px", fontWeight: 500, letterSpacing: "-0.14px" }}
                          >
                            <Clock className="h-4 w-4" style={{ color: "#999999" }} />
                            <span>{converted.time}</span>
                          </span>
                        </>
                      );
                    })()}
                  </div>

                  <div className="pt-2">
                    <Link href={slides[currentSlide].actionUrl} className="btn-primary" style={{ height: "44px", padding: "12px 24px", backgroundColor: "#ffffff", color: "#000000" }}>
                      <Play className="h-4 w-4 fill-black text-black translate-x-0.5" />
                      <span>{slides[currentSlide].actionText}</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-5 text-left max-w-2xl">
                  <div className="flex items-center gap-3">
                    <Badge
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        padding: "2px 10px",
                        borderRadius: "6px",
                        backgroundColor: "rgba(255,255,255,0.1)",
                        color: "#ffffff",
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      {slides[currentSlide].badge}
                    </Badge>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: "rgba(255,255,255,0.6)",
                        textTransform: "uppercase",
                      }}
                    >
                      {slides[currentSlide].round}
                    </span>
                  </div>

                  <h1
                    className="tracking-[-1px] sm:tracking-[-4.25px]"
                    style={{
                      fontSize: "clamp(1.75rem, 5.5vw, 5.3125rem)",
                      fontWeight: 500,
                      lineHeight: 0.95,
                      color: "#ffffff",
                    }}
                  >
                    {slides[currentSlide].title}
                  </h1>

                  <p
                    style={{
                      fontSize: "clamp(0.75rem, 1.5vw, 1rem)",
                      color: "#cccccc",
                      fontWeight: 400,
                      lineHeight: 1.5,
                      letterSpacing: "-0.15px",
                    }}
                    className="max-w-xl"
                  >
                    {slides[currentSlide].description}
                  </p>

                  <div className="pt-2">
                    <Link href={slides[currentSlide].actionUrl} className="btn-primary" style={{ height: "44px", padding: "12px 24px", backgroundColor: "#ffffff", color: "#000000" }}>
                      <Play className="h-4 w-4 fill-black text-black translate-x-0.5" />
                      <span>{slides[currentSlide].actionText}</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-20 md:bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className="rounded-full transition-all duration-300 cursor-pointer"
              style={{
                height: "8px",
                width: currentSlide === idx ? "24px" : "8px",
                backgroundColor: currentSlide === idx ? "#ffffff" : "rgba(255,255,255,0.35)",
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
