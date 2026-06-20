import { NextResponse } from "next/server";

const STADIUMS_URL =
  process.env.OPENFOOTBALL_STADIUMS_URL ||
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.stadiums.json";

let cachedData: any[] | null = null;
let cachedAt = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export async function GET() {
  const now = Date.now();

  if (cachedData && now - cachedAt < CACHE_TTL) {
    return NextResponse.json(cachedData);
  }

  try {
    const res = await fetch(STADIUMS_URL, { next: { revalidate: 86400 } });

    if (!res.ok) {
      throw new Error(`OpenFootball stadiums fetch failed: ${res.status}`);
    }

    const raw: { stadiums: any[] } = await res.json();

    const stadiums = (raw.stadiums ?? []).map((s: any) => ({
      name: s.name ?? "",
      city: s.city ?? "",
      cc: s.cc ?? "",
      capacity: s.capacity ?? 0,
      timezone: s.timezone ?? "",
      coords: s.coords ?? "",
    }));

    // Sort by capacity descending
    stadiums.sort((a: any, b: any) => b.capacity - a.capacity);

    cachedData = stadiums;
    cachedAt = now;

    return NextResponse.json(stadiums);
  } catch (error) {
    console.error("[Stadiums API] Error:", error);

    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    return NextResponse.json(
      { error: "Failed to fetch stadiums data" },
      { status: 500 }
    );
  }
}
