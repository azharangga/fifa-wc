import { NextResponse } from "next/server";
import { v5 as uuidv5 } from "uuid";

export const dynamic = "force-dynamic";

// ─── OpenFootball public dataset (no API key required) ───────────────────────
// https://github.com/openfootball/worldcup.json
const OPENFOOTBALL_URL =
  process.env.OPENFOOTBALL_WORLDCUP_URL ||
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

const UUID_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

export async function GET() {
  try {
    const res = await fetch(OPENFOOTBALL_URL, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`OpenFootball fetch failed: ${res.status}`);
    }

    // The raw.githubusercontent.com CDN serves the file as UTF-8.
    // The data itself is valid UTF-8 with proper multi-byte sequences for
    // accented characters (e.g. Julián, Quiñones). Use res.text() directly.
    const text = await res.text();
    const raw: { name: string; matches: any[] } = JSON.parse(text);

    if (!raw || !Array.isArray(raw.matches)) {
      throw new Error("Unexpected OpenFootball data format");
    }

    const matches = raw.matches.map((m: any) => {
      // Stable ID derived from match number + teams + date
      const seedKey = `${m.num ?? ""}${m.team1}-${m.team2}-${m.date}`;
      const id = uuidv5(seedKey, UUID_NAMESPACE);

      // Group name: OpenFootball uses "Group A", "Group B", etc. directly
      const group: string | undefined = m.group ?? undefined;

      // Normalise goal scorer objects — OpenFootball encodes them as
      // { name, minute } with optional penalty / owngoal flags
      const normaliseGoals = (goals: any[] | undefined) =>
        (goals ?? []).map((g: any) => ({
          name: g.name ?? "",
          minute: String(g.minute ?? ""),
          ...(g.penalty ? { penalty: true } : {}),
          ...(g.owngoal ? { owngoal: true } : {}),
        }));

      // Score — only present when the match was played
      const score =
        m.score && Array.isArray(m.score.ft)
          ? { ft: m.score.ft as [number, number], ht: m.score.ht as [number, number] }
          : undefined;

      return {
        id,
        // match number (1-104)
        matchNumber: m.num,
        round: m.round ?? "",
        date: m.date,
        time: m.time ?? "TBD",
        team1: m.team1,
        team2: m.team2,
        group,
        ground: m.ground ?? "",
        score,
        goals1: normaliseGoals(m.goals1),
        goals2: normaliseGoals(m.goals2),
      };
    });

    const outputData = {
      name: raw.name ?? "World Cup 2026",
      matches,
    };
    return NextResponse.json(outputData);
  } catch (error) {
    console.error("[WorldCup API] Error:", error);

    return NextResponse.json(
      { error: "Failed to fetch World Cup data from OpenFootball" },
      { status: 500 }
    );
  }
}
