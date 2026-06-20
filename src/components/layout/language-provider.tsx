"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "id";

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav & Common
    home: "Home",
    standing: "Standing",
    schedule: "Schedule",
    knockout: "Knockout",
    live: "Live",
    ft: "FT",
    scheduled: "Scheduled",
    venue: "Venue",
    date: "Date",
    stage: "Stage",
    group: "Group",
    
    // Search
    searchPlaceholder: "Search matches, stadiums, scorers (e.g. 'Mex vs SA')...",
    searchTooltip: "Search tournament (Ctrl+K or /)",
    clearSearch: "Clear search",
    closeSearch: "Close search (Esc)",
    recentSearches: "Recent Searches",
    searchWc: "Search World Cup 2026",
    searchDesc: "Find matches by team name, venue, city, stage, date, or scorer.",
    noResults: "No results found",
    noResultsDesc: 'No matches or scorers matched "{query}".',
    results: "Results",
    navigate: "Navigate",
    select: "Select",
    escToClose: "Press ESC to close",

    // Home
    liveMatches: "Live & Featured Matches",
    viewAllMatches: "View All Matches",
    upcomingFixtures: "Upcoming Fixtures",
    groupStandings: "Group Standings",
    viewStandings: "View Standings",
    knockoutBracket: "Knockout Bracket",
    viewFullBracket: "View Full Bracket",
    statsTitle: "Tournament Insights",
    statsSubtitle: "Real-time updates on tournament leaders, top scorers, and standout performances.",
    
    // Stats Banner
    cleanSheetsLeader: "Clean Sheets Leader",
    topAttackingTeam: "Top Attacking Team",
    highestScoringMatch: "Highest Scoring Match",
    goalsScored: "goals scored",
    cleanSheetsCount: "clean sheets",
    goalsCount: "goals",
    
    // Top Scorers
    topScorersTitle: "Golden Boot Race",
    topScorersSubtitle: "Top goalscorers of the tournament.",
    player: "Player",
    team: "Team",
    goals: "Goals",
    penalties: "Penalties",
    noScorers: "No goals scored yet",

    // Standings / Groups
    groupsTitle: "Tournament Standings",
    groupsSubtitle: "Live standings, group stages status, and third-place rankings.",
    tabGroups: "Group Tables",
    tabThirdPlace: "Third-Place Teams",
    tabScorers: "Top Scorers",
    tableMp: "MP",
    tableW: "W",
    tableD: "D",
    tableL: "L",
    tableGf: "GF",
    tableGa: "GA",
    tableGd: "GD",
    tablePts: "Pts",
    
    // Third place
    thirdPlaceTitle: "Third-Place Ranking",
    thirdPlaceDesc: "The top 8 third-place teams across all groups qualify for the Round of 32.",
    thirdPlaceQualifiers: "Qualified (Top 8)",
    thirdPlaceActive: "In contention",
    
    // Schedule
    scheduleTitle: "Match Schedule",
    scheduleSubtitle: "Full fixture list, results, and live stream coverage details.",
    tabAll: "All Matches",
    tabGroupStage: "Group Stage",
    tabKnockoutStage: "Knockout Stage",
    filterPlaceholder: "Filter by team...",
    noMatchesFound: "No matches found matching your filters.",
    kickoff: "Kickoff",
    watchLive: "Watch Live Stream",

    // Knockouts
    knockoutTitle: "Knockout Bracket",
    knockoutSubtitle: "Path to the Final at MetLife Stadium.",
    round32: "Round of 32",
    round16: "Round of 16",
    quarterfinals: "Quarter-finals",
    semifinals: "Semi-finals",
    final: "Final",
    thirdPlacePlayoff: "Third Place Play-off",

    // Match Details / HLS Player
    streamOffline: "Broadcast Offline",
    streamOfflineDesc: "This match has ended. You can view the final score and goal logs below.",
    goalsTimeline: "Goals Timeline",
    matchEvents: "Match Events",
    noGoalsEvents: "No events recorded in this match.",
    ownGoalShort: "OG",
    penaltyShort: "P",
    liveQuality: "QUALITY",
    liveIndicator: "LIVE",
    streamVenue: "STADIUM",
    connectingLiveLines: "Connecting live streaming lines...",
    syncError: "Sync Error",
    matchNotFound: "Match stream could not be found.",
    backToHome: "Back to Home",
    matchNumberText: "Match {matchNumber}",
    liveNow: "LIVE NOW",
    fullTime: "FULL TIME",
    upcoming: "UPCOMING",
    stadiumVenue: "Stadium Venue",
    tournamentArena: "Tournament Arena",
    officialMatchCenter: "Official Match Center",
    connectingFeed: "Connecting Feed",
    initializingStream: "Initializing live stream...",
    hlsNetworkError: "Network error — stream may be unavailable in your region",
    hlsMediaError: "Media error — attempting recovery...",
    hlsStreamError: "Stream error — please try another channel",
    hlsNotSupported: "HLS is not supported in this browser",
    chooseDifferentChannel: "Choose a different channel below",
    back10s: "Back 10s (←)",
    forward10s: "Forward 10s (→)",
    playbackSpeed: "Playback Speed",
    pictureInPicture: "Picture in Picture (P)",
    fullscreen: "Fullscreen (F)",
    matchGoalsLog: "Match Goals Log",
    noGoalsScored: "No goals scored.",
    chooseBroadcastChannel: "Choose Broadcast Channel",
    switchChannelsDesc: "Switch channels if the current stream is laggy or unavailable.",
    activeChannel: "ACTIVE",

    // Footer
    footerDesc: "Your destination for the 2026 FIFA World Cup. Live scores, standings, bracket results, and live match streaming.",
    footerCopyright: "© 2026 World Cup 2026. All rights reserved.",
    footerCredits: "Match data by openfootball",

    // Teams
    teams: "Teams",
    teamsTitle: "48 Qualified Teams",
    teamsSubtitle: "All participating nations across 12 groups and 6 confederations.",
    allConfederations: "All",
    allGroups: "All Groups",
    searchTeams: "Search teams...",
    noTeamsFound: "No teams found matching your filters.",

    // Team Detail
    squad: "Squad",
    position: "Position",
    club: "Club",
    age: "Age",
    goalkeeper: "Goalkeepers",
    defender: "Defenders",
    midfielder: "Midfielders",
    forward: "Forwards",
    groupMatches: "Group Stage Matches",
    playerCount: "{count} players",

    // Stadiums
    stadiums: "Stadiums",
    stadiumsTitle: "16 Venues Across 3 Nations",
    stadiumsSubtitle: "World-class stadiums hosting the biggest tournament in football history.",
    capacity: "Capacity",
    timezone: "Timezone",
    hostCity: "Host City",
    allCountries: "All",
    noStadiumsFound: "No stadiums found.",
    seats: "seats",
  },
  id: {
    // Nav & Common
    home: "Beranda",
    standing: "Klasemen",
    schedule: "Jadwal",
    knockout: "Fase Gugur",
    live: "Langsung",
    ft: "Selesai",
    scheduled: "Terjadwal",
    venue: "Stadion",
    date: "Tanggal",
    stage: "Fase",
    group: "Grup",

    // Search
    searchPlaceholder: "Cari pertandingan, stadion, pencetak gol (misal 'Mex vs SA')...",
    searchTooltip: "Cari turnamen (Ctrl+K atau /)",
    clearSearch: "Bersihkan pencarian",
    closeSearch: "Tutup pencarian (Esc)",
    recentSearches: "Pencarian Terakhir",
    searchWc: "Cari Piala Dunia 2026",
    searchDesc: "Temukan pertandingan berdasarkan nama tim, stadion, kota, fase, tanggal, atau pencetak gol.",
    noResults: "Tidak ada hasil ditemukan",
    noResultsDesc: 'Tidak ada pertandingan atau pencetak gol yang cocok dengan "{query}".',
    results: "Hasil",
    navigate: "Navigasi",
    select: "Pilih",
    escToClose: "Tekan ESC untuk menutup",

    // Home
    liveMatches: "Pertandingan Langsung & Pilihan",
    viewAllMatches: "Lihat Semua Pertandingan",
    upcomingFixtures: "Jadwal Mendatang",
    groupStandings: "Klasemen Grup",
    viewStandings: "Lihat Klasemen",
    knockoutBracket: "Bagan Fase Gugur",
    viewFullBracket: "Lihat Bagan Lengkap",
    statsTitle: "Wawasan Turnamen",
    statsSubtitle: "Pembaruan langsung mengenai pemimpin turnamen, pencetak gol terbanyak, dan performa terbaik.",

    // Stats Banner
    cleanSheetsLeader: "Kiper dengan Nirbobol Terbanyak",
    topAttackingTeam: "Tim dengan Penyerangan Terbaik",
    highestScoringMatch: "Pertandingan dengan Gol Terbanyak",
    goalsScored: "gol dicetak",
    cleanSheetsCount: "pertandingan nirbobol",
    goalsCount: "gol",

    // Top Scorers
    topScorersTitle: "Perebutan Sepatu Emas",
    topScorersSubtitle: "Daftar pencetak gol terbanyak turnamen.",
    player: "Pemain",
    team: "Tim",
    goals: "Gol",
    penalties: "Penalti",
    noScorers: "Belum ada gol yang dicetak",

    // Standings / Groups
    groupsTitle: "Klasemen Turnamen",
    groupsSubtitle: "Klasemen langsung, status fase grup, dan peringkat tempat ketiga terbaik.",
    tabGroups: "Tabel Grup",
    tabThirdPlace: "Peringkat Ketiga Terbaik",
    tabScorers: "Pencetak Gol Terbanyak",
    tableMp: "Main",
    tableW: "M",
    tableD: "S",
    tableL: "K",
    tableGf: "GM",
    tableGa: "GK",
    tableGd: "SG",
    tablePts: "Poin",

    // Third place
    thirdPlaceTitle: "Peringkat Tempat Ketiga Terbaik",
    thirdPlaceDesc: "8 tim peringkat ketiga terbaik dari seluruh grup akan lolos ke Babak 32 Besar.",
    thirdPlaceQualifiers: "Lolos (Top 8)",
    thirdPlaceActive: "Dalam Persaingan",

    // Schedule
    scheduleTitle: "Jadwal Pertandingan",
    scheduleSubtitle: "Daftar lengkap pertandingan, hasil, dan detail siaran langsung.",
    tabAll: "Semua Pertandingan",
    tabGroupStage: "Fase Grup",
    tabKnockoutStage: "Fase Gugur",
    filterPlaceholder: "Cari berdasarkan nama tim...",
    noMatchesFound: "Tidak ada pertandingan yang sesuai dengan saringan Anda.",
    kickoff: "Mulai",
    watchLive: "Tonton Siaran Langsung",

    // Knockouts
    knockoutTitle: "Bagan Fase Gugur",
    knockoutSubtitle: "Jalur menuju Final di Stadion MetLife.",
    round32: "Babak 32 Besar",
    round16: "Babak 16 Besar",
    quarterfinals: "Perempat Final",
    semifinals: "Semifinal",
    final: "Final",
    thirdPlacePlayoff: "Perebutan Tempat Ketiga",

    // Match Details / HLS Player
    streamOffline: "Siaran Selesai / Offline",
    streamOfflineDesc: "Pertandingan ini telah selesai. Anda dapat melihat hasil akhir dan daftar gol di bawah.",
    goalsTimeline: "Kronologi Gol",
    matchEvents: "Peristiwa Pertandingan",
    noGoalsEvents: "Tidak ada peristiwa yang tercatat dalam pertandingan ini.",
    ownGoalShort: "GBD", // Gol bunuh diri
    penaltyShort: "P",
    liveQuality: "KUALITAS",
    liveIndicator: "LIVE",
    streamVenue: "STADION",
    connectingLiveLines: "Menghubungkan jalur siaran langsung...",
    syncError: "Kesalahan Sinkronisasi",
    matchNotFound: "Siaran pertandingan tidak ditemukan.",
    backToHome: "Kembali ke Beranda",
    matchNumberText: "Pertandingan {matchNumber}",
    liveNow: "LANGSUNG",
    fullTime: "SELESAI",
    upcoming: "MENDATANG",
    stadiumVenue: "Stadion Tempat",
    tournamentArena: "Arena Turnamen",
    officialMatchCenter: "Pusat Pertandingan Resmi",
    connectingFeed: "Menghubungkan Feed",
    initializingStream: "Menginisialisasi siaran langsung...",
    hlsNetworkError: "Kesalahan jaringan — siaran mungkin tidak tersedia di wilayah Anda",
    hlsMediaError: "Kesalahan media — mencoba memulihkan...",
    hlsStreamError: "Kesalahan siaran — silakan coba saluran lain",
    hlsNotSupported: "HLS tidak didukung di browser ini",
    chooseDifferentChannel: "Pilih saluran lain di bawah",
    back10s: "Mundur 10 detik (←)",
    forward10s: "Maju 10 detik (→)",
    playbackSpeed: "Kecepatan Putar",
    pictureInPicture: "Gambar dalam Gambar (P)",
    fullscreen: "Layar Penuh (F)",
    matchGoalsLog: "Log Gol Pertandingan",
    noGoalsScored: "Tidak ada gol yang dicetak.",
    chooseBroadcastChannel: "Pilih Saluran Siaran",
    switchChannelsDesc: "Ganti saluran jika siaran saat ini lambat atau tidak tersedia.",
    activeChannel: "AKTIF",

    // Footer
    footerDesc: "Destinasi terlengkap Piala Dunia FIFA 2026. Skor langsung, klasemen, hasil fase gugur, dan streaming pertandingan live.",
    footerCopyright: "© 2026 World Cup 2026. Seluruh hak dilindungi.",
    footerCredits: "Data pertandingan oleh openfootball",

    // Teams
    teams: "Tim",
    teamsTitle: "48 Tim Lolos Kualifikasi",
    teamsSubtitle: "Seluruh negara peserta di 12 grup dan 6 konfederasi.",
    allConfederations: "Semua",
    allGroups: "Semua Grup",
    searchTeams: "Cari tim...",
    noTeamsFound: "Tidak ada tim yang cocok dengan filter Anda.",

    // Team Detail
    squad: "Skuad",
    position: "Posisi",
    club: "Klub",
    age: "Usia",
    goalkeeper: "Kiper",
    defender: "Bek",
    midfielder: "Gelandang",
    forward: "Penyerang",
    groupMatches: "Pertandingan Fase Grup",
    playerCount: "{count} pemain",

    // Stadiums
    stadiums: "Stadion",
    stadiumsTitle: "16 Venue di 3 Negara",
    stadiumsSubtitle: "Stadion berkelas dunia yang menjadi tuan rumah turnamen sepak bola terbesar dalam sejarah.",
    capacity: "Kapasitas",
    timezone: "Zona Waktu",
    hostCity: "Kota Tuan Rumah",
    allCountries: "Semua",
    noStadiumsFound: "Tidak ada stadion ditemukan.",
    seats: "kursi",
  }
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("wc2026-language") as Language;
      if (saved === "en" || saved === "id") {
        setLangState(saved);
      }
    }
    setMounted(true);
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("wc2026-language", newLang);
    }
  };

  const t = (key: string, variables?: Record<string, string>): string => {
    let text = translations[lang]?.[key] || translations["en"]?.[key] || key;
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
