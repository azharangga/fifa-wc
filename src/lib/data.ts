import { Match, GroupStanding, GroupData, KnockoutRound } from "./types";

export function computeGroupStandings(matches: Match[]): Map<string, GroupStanding> {
  const standings = new Map<string, GroupStanding>();

  for (const match of matches) {
    if (!match.score?.ft) continue;

    const [s1, s2] = match.score.ft;

    if (!standings.has(match.team1)) {
      standings.set(match.team1, {
        team: match.team1,
        played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
        form: [],
      });
    }
    if (!standings.has(match.team2)) {
      standings.set(match.team2, {
        team: match.team2,
        played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
        form: [],
      });
    }

    const t1 = standings.get(match.team1)!;
    const t2 = standings.get(match.team2)!;

    t1.played++;
    t2.played++;
    t1.goalsFor += s1;
    t1.goalsAgainst += s2;
    t2.goalsFor += s2;
    t2.goalsAgainst += s1;
    t1.goalDifference = t1.goalsFor - t1.goalsAgainst;
    t2.goalDifference = t2.goalsFor - t2.goalsAgainst;

    if (s1 > s2) {
      t1.won++;
      t1.points += 3;
      t2.lost++;
      t1.form.push("W");
      t2.form.push("L");
    } else if (s1 < s2) {
      t2.won++;
      t2.points += 3;
      t1.lost++;
      t1.form.push("L");
      t2.form.push("W");
    } else {
      t1.drawn++;
      t2.drawn++;
      t1.points++;
      t2.points++;
      t1.form.push("D");
      t2.form.push("D");
    }
  }

  return standings;
}

export function organizeGroups(matches: Match[]): GroupData[] {
  const groupMap = new Map<string, Match[]>();

  for (const match of matches) {
    if (!match.group) continue;
    if (!groupMap.has(match.group)) {
      groupMap.set(match.group, []);
    }
    groupMap.get(match.group)!.push(match);
  }

  const groups: GroupData[] = [];
  const sortedKeys = Array.from(groupMap.keys()).sort();

  for (const key of sortedKeys) {
    const groupMatches = groupMap.get(key)!;
    const standingsMap = computeGroupStandings(groupMatches);
    const standings = Array.from(standingsMap.values()).sort(
      (a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor
    );
    groups.push({ name: key, standings, matches: groupMatches });
  }

  return groups;
}

export function organizeKnockout(matches: Match[]): KnockoutRound[] {
  const roundMap = new Map<string, Match[]>();
  const roundOrder = [
    "Round of 32",
    "Round of 16",
    "Quarter-final",
    "Semi-final",
    "Match for third place",
    "Final",
  ];

  for (const match of matches) {
    if (match.group) continue;
    if (!roundMap.has(match.round)) {
      roundMap.set(match.round, []);
    }
    roundMap.get(match.round)!.push(match);
  }

  return roundOrder
    .filter((r) => roundMap.has(r))
    .map((r) => ({ name: r, matches: roundMap.get(r)! }));
}

export function formatDate(dateStr: string, lang: string = "en"): string {
  // Use timeZone: "UTC" so the displayed date always matches the raw dateStr
  // regardless of where the visitor's browser is located.
  const date = new Date(dateStr + "T00:00:00Z");
  return date.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Returns the YYYY-MM-DD date string in WIB (UTC+7) for a given match.
 *
 * When the match time causes a midnight crossover into the next calendar day
 * in WIB (e.g. 13:00 UTC-6 = 02:00 WIB next day), this returns the *next*
 * day's date string — which is used as the grouping key in the schedule page
 * so matches appear under the correct WIB date section.
 *
 * Falls back to the original `dateStr` when no time is available.
 */
export function getMatchWibDateStr(dateStr: string, timeStr: string | undefined): string {
  if (!timeStr || timeStr === "TBD") return dateStr;

  const m = timeStr.match(/(\d{1,2}):(\d{2})(?:\s+UTC([+-]\d+))?/);
  if (!m) return dateStr;

  const [, hourStr, minuteStr, utcOffsetStr] = m;
  const utcOffset = utcOffsetStr ? parseInt(utcOffsetStr, 10) : 0;

  // Build UTC instant
  const utcDate = new Date(`${dateStr}T${hourStr.padStart(2, "0")}:${minuteStr}:00Z`);
  utcDate.setUTCHours(utcDate.getUTCHours() - utcOffset);

  // Apply WIB (+7h) and return YYYY-MM-DD
  const wibDate = new Date(utcDate.getTime() + 7 * 60 * 60 * 1000);
  return wibDate.toISOString().slice(0, 10);
}


/**
 * Convert a match's local time string (e.g. "13:00 UTC-6") to a display-friendly
 * time + date in the requested language / timezone.
 *
 * For Indonesian (WIB = UTC+7) we explicitly apply the +7-hour offset using pure
 * UTC arithmetic so the result is ALWAYS correct regardless of the visitor's
 * browser timezone — including detecting midnight crossovers (e.g. 22:00 UTC
 * becomes 05:00 WIB the *next* day).
 *
 * Returns both `time` (formatted string) and `date` (formatted string that may
 * differ from the raw `dateStr` due to timezone shift).
 * Also returns `dateShifted` (boolean) so callers can highlight the date change.
 */
export function convertTimeToUserTimezone(
  dateStr: string,
  timeStr: string,
  lang: string = "en"
): { time: string; date: string; dateShifted: boolean } {
  if (!timeStr || timeStr === "TBD") {
    return { time: timeStr, date: formatDate(dateStr, lang), dateShifted: false };
  }

  // Parse "HH:MM UTC±N" — offset is optional (defaults to 0 = UTC)
  const m = timeStr.match(/(\d{1,2}):(\d{2})(?:\s+UTC([+-]\d+))?/);
  if (!m) return { time: timeStr, date: formatDate(dateStr, lang), dateShifted: false };

  const [, hourStr, minuteStr, utcOffsetStr] = m;
  const utcOffset = utcOffsetStr ? parseInt(utcOffsetStr, 10) : 0;

  // ── Step 1: Compute the UTC timestamp ──────────────────────────────────────
  // Treat the time string as the match's *local* clock, then subtract the
  // UTC offset to arrive at the true UTC instant.
  // e.g. "13:00 UTC-6" → local 13:00 in UTC-6 → UTC 19:00
  const utcDate = new Date(
    `${dateStr}T${hourStr.padStart(2, "0")}:${minuteStr}:00Z`
  );
  // utcDate is currently treating match-local time as UTC; fix by subtracting offset
  utcDate.setUTCHours(utcDate.getUTCHours() - utcOffset);

  // Original UTC date string for shift comparison
  const originalUtcDateStr = dateStr;

  if (lang === "id") {
    // ── Step 2 (ID): Apply WIB offset explicitly ────────────────────────────
    // WIB = UTC+7.  We add 7 hours to the UTC timestamp and then read the
    // result using *UTC* accessors — this avoids any browser-timezone influence.
    const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
    const wibDate = new Date(utcDate.getTime() + WIB_OFFSET_MS);

    const h = wibDate.getUTCHours().toString().padStart(2, "0");
    const min = wibDate.getUTCMinutes().toString().padStart(2, "0");
    const localTime = `${h}.${min} WIB`;

    // Format the WIB-adjusted date using id-ID locale.
    // timeZone: "UTC" is intentional — wibDate already contains +7h, so we
    // ask the formatter to render the UTC fields (which ARE the WIB fields).
    const localDate = wibDate.toLocaleDateString("id-ID", {
      timeZone: "UTC",
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    // Detect midnight crossover: compare WIB date with original match date
    const wibDateStr = wibDate.toISOString().slice(0, 10); // "YYYY-MM-DD"
    const dateShifted = wibDateStr !== originalUtcDateStr;

    return { time: localTime, date: localDate, dateShifted };
  } else {
    // ── Step 2 (EN): Show the original match-local time ─────────────────────
    // Rather than converting to the viewer's browser timezone (which is
    // unpredictable), we display the time as printed on the match schedule
    // (i.e. the venue's local clock), formatted as 12-hour AM/PM.
    const matchHour = parseInt(hourStr, 10);
    const h12 = matchHour === 0 ? 12 : matchHour > 12 ? matchHour - 12 : matchHour;
    const ampm = matchHour < 12 ? "AM" : "PM";
    const localTime = `${h12.toString().padStart(2, "0")}:${minuteStr} ${ampm}`;

    // Date stays as the official match date (no timezone shift for EN)
    const localDate = new Date(`${dateStr}T12:00:00Z`).toLocaleDateString(
      "en-US",
      { timeZone: "UTC", weekday: "short", month: "short", day: "numeric" }
    );

    return { time: localTime, date: localDate, dateShifted: false };
  }
}

export function getMatchStatus(match: Match): "completed" | "upcoming" | "live" {
  if (match.score?.ft) return "completed";

  let startTime: Date;
  if (match.time && match.time !== "TBD") {
    const m = match.time.match(/(\d{1,2}):(\d{2})(?:\s+UTC([+-]\d+))?/);
    if (m) {
      const [, hourStr, minuteStr, utcOffsetStr] = m;
      const utcOffset = utcOffsetStr ? parseInt(utcOffsetStr, 10) : 0;
      const d = new Date(`${match.date}T${hourStr.padStart(2, "0")}:${minuteStr}:00Z`);
      d.setUTCHours(d.getUTCHours() - utcOffset);
      startTime = d;
    } else {
      startTime = new Date(match.date + "T12:00:00Z");
    }
  } else {
    startTime = new Date(match.date + "T12:00:00Z");
  }

  const now = new Date();
  const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours match duration

  if (now < startTime) {
    return "upcoming";
  } else if (now >= startTime && now < endTime) {
    return "live";
  } else {
    return "completed";
  }
}

export function getCountryFlagUrl(teamName: string): string {
  const codeMap: Record<string, string> = {
    "Mexico": "mx", "South Africa": "za", "South Korea": "kr",
    "Czech Republic": "cz", "Canada": "ca", "Bosnia & Herzegovina": "ba",
    "Qatar": "qa", "Switzerland": "ch", "Brazil": "br", "Morocco": "ma",
    "Haiti": "ht", "Scotland": "gb-sct", "USA": "us",
    "Paraguay": "py", "Australia": "au", "Turkey": "tr", "Germany": "de",
    "Curaçao": "cw", "Ivory Coast": "ci", "Ecuador": "ec",
    "Netherlands": "nl", "Japan": "jp", "Sweden": "se", "Tunisia": "tn",
    "Belgium": "be", "Egypt": "eg", "Iran": "ir", "New Zealand": "nz",
    "Spain": "es", "Cape Verde": "cv", "Saudi Arabia": "sa",
    "Uruguay": "uy", "France": "fr", "Senegal": "sn", "Iraq": "iq",
    "Norway": "no", "Argentina": "ar", "Algeria": "dz", "Austria": "at",
    "Jordan": "jo", "Portugal": "pt", "Colombia": "co", "Cameroon": "cm",
    "Wales": "gb-wls", "Ukraine": "ua", "Chile": "cl", "Peru": "pe",
    "Nigeria": "ng", "Costa Rica": "cr", "Panama": "pa", "Jamaica": "jm",
    "DR Congo": "cd", "Thailand": "th", "Uzbekistan": "uz", "China PR": "cn",
    "Poland": "pl", "Croatia": "hr", "Denmark": "dk", "Serbia": "rs",
    "England": "gb-eng", "Italy": "it", "Romania": "ro", "Greece": "gr",
    "Congo": "cg", "Guinea": "gn", "Mali": "ml", "Gabon": "ga",
    "Venezuela": "ve", "Honduras": "hn", "Ghana": "gh",
  };

  // For placeholder teams like "1A", "2B", "W73", etc.
  if (/^[12][A-Z]$/.test(teamName) || /^W\d+$/.test(teamName) || /^L\d+$/.test(teamName) || teamName.includes(" vs ")) {
    return "";
  }

  const code = codeMap[teamName];
  if (!code) return "";
  
  // High quality SVG flag URL
  return `https://flagcdn.com/${code}.svg`;
}

export function getCountryFlag(teamName: string): string {
  const flagMap: Record<string, string> = {
    "Mexico": "🇲🇽", "South Africa": "🇿🇦", "South Korea": "🇰🇷",
    "Czech Republic": "🇨🇿", "Canada": "🇨🇦", "Bosnia & Herzegovina": "🇧🇦",
    "Qatar": "🇶🇦", "Switzerland": "🇨🇭", "Brazil": "🇧🇷", "Morocco": "🇲🇦",
    "Haiti": "🇭🇹", "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "USA": "🇺🇸",
    "Paraguay": "🇵🇾", "Australia": "🇦🇺", "Turkey": "🇹🇷", "Germany": "🇩🇪",
    "Curaçao": "🇨🇼", "Ivory Coast": "🇨🇮", "Ecuador": "🇪🇨",
    "Netherlands": "🇳🇱", "Japan": "🇯🇵", "Sweden": "🇸🇪", "Tunisia": "🇹🇳",
    "Belgium": "🇧🇪", "Egypt": "🇪🇬", "Iran": "🇮🇷", "New Zealand": "🇳🇿",
    "Spain": "🇪🇸", "Cape Verde": "🇨🇻", "Saudi Arabia": "🇸🇦",
    "Uruguay": "🇺🇾", "France": "🇫🇷", "Senegal": "🇸🇳", "Iraq": "🇮🇶",
    "Norway": "🇳🇴", "Argentina": "🇦🇷", "Algeria": "🇩🇿", "Austria": "🇦🇹",
    "Jordan": "🇯🇴", "Portugal": "🇵🇹", "Colombia": "🇨🇴", "Cameroon": "🇨🇲",
    "Wales": "🏴󠁧󠁢󠁷󠁬󠁳󠁿", "Ukraine": "🇺🇦", "Chile": "🇨🇱", "Peru": "🇵🇪",
    "Nigeria": "🇳🇬", "Costa Rica": "🇨🇷", "Panama": "🇵🇦", "Jamaica": "🇯🇲",
    "DR Congo": "🇨🇩", "Thailand": "🇹🇭", "Uzbekistan": "🇺🇿", "China PR": "🇨🇳",
    "Poland": "🇵🇱", "Croatia": "🇭🇷", "Denmark": "🇩🇰", "Serbia": "🇷🇸",
    "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Italy": "🇮🇹", "Romania": "🇷🇴", "Greece": "🇬🇷",
    "Congo": "🇨🇬", "Guinea": "🇬🇳", "Mali": "🇲🇱", "Gabon": "🇬🇦",
    "Venezuela": "🇻🇪", "Honduras": "🇭🇳", "Ghana": "🇬🇭",
  };

  if (/^[12][A-Z]$/.test(teamName) || /^W\d+$/.test(teamName) || /^L\d+$/.test(teamName) || teamName.includes(" vs ")) {
    return "🏆";
  }

  return flagMap[teamName] || "⚽";
}

export function getStadiumImage(ground?: string): string {
  if (!ground) return "/images/stadium_night.png";
  const name = ground.toLowerCase();
  
  if (name.includes("azteca") || name.includes("mexico")) {
    return "/images/estadio_azteca.png";
  }
  if (name.includes("metlife") || name.includes("york") || name.includes("jersey")) {
    return "/images/metlife_stadium.png";
  }
  if (name.includes("sofi") || name.includes("los angeles")) {
    return "/images/sofi_stadium.png";
  }
  if (name.includes("bc place") || name.includes("vancouver")) {
    return "/images/bc_place.png";
  }
  if (name.includes("akron") || name.includes("guadalajara") || name.includes("bbva") || name.includes("monterrey") || name.includes("miami") || name.includes("hard rock")) {
    return "/images/stadium_dusk.png";
  }
  if (name.includes("mercedes") || name.includes("atlanta") || name.includes("dallas") || name.includes("at&t") || name.includes("nrg") || name.includes("houston") || name.includes("lumen") || name.includes("seattle")) {
    return "/images/stadium_night.png";
  }
  return "/images/stadium_aerial.png";
}
