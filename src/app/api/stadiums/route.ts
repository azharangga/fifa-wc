import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const STADIUMS_URL =
  process.env.OPENFOOTBALL_STADIUMS_URL ||
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.stadiums.json";

export async function GET() {
  try {
    const res = await fetch(STADIUMS_URL, { cache: "no-store" });

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

    return NextResponse.json(stadiums);
  } catch (error) {
    console.error("[Stadiums API] Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch stadiums data" },
      { status: 500 }
    );
  }
}
