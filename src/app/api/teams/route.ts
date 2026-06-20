import { NextResponse } from "next/server";

const TEAMS_URL =
  process.env.OPENFOOTBALL_TEAMS_URL ||
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.teams.json";
const SQUADS_URL =
  process.env.OPENFOOTBALL_SQUADS_URL ||
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.squads.json";

let cachedData: any[] | null = null;
let cachedAt = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export async function GET() {
  const now = Date.now();

  if (cachedData && now - cachedAt < CACHE_TTL) {
    return NextResponse.json(cachedData);
  }

  try {
    const [teamsRes, squadsRes] = await Promise.all([
      fetch(TEAMS_URL, { next: { revalidate: 3600 } }),
      fetch(SQUADS_URL, { next: { revalidate: 3600 } }),
    ]);

    if (!teamsRes.ok || !squadsRes.ok) {
      throw new Error("Failed to fetch teams/squads data");
    }

    const teamsRaw: any[] = await teamsRes.json();
    const squadsRaw: any[] = await squadsRes.json();

    // Build a map from team name -> players
    const squadMap = new Map<string, any[]>();
    for (const squad of squadsRaw) {
      squadMap.set(squad.name, squad.players ?? []);
    }

    // Merge teams with their squads
    const teams = teamsRaw.map((t: any) => ({
      name: t.name,
      fifa_code: t.fifa_code ?? "",
      group: t.group ?? "",
      confed: t.confed ?? "",
      continent: t.continent ?? "",
      flag_icon: t.flag_icon ?? "",
      players: (squadMap.get(t.name) ?? []).map((p: any) => ({
        number: p.number ?? 0,
        pos: p.pos ?? "",
        name: p.name ?? "",
        club: p.club ?? { name: "", country: "" },
        date_of_birth: p.date_of_birth ?? "",
      })),
    }));

    // Sort by group letter then name
    teams.sort(
      (a: any, b: any) =>
        a.group.localeCompare(b.group) || a.name.localeCompare(b.name)
    );

    cachedData = teams;
    cachedAt = now;

    return NextResponse.json(teams);
  } catch (error) {
    console.error("[Teams API] Error:", error);

    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    return NextResponse.json(
      { error: "Failed to fetch teams data" },
      { status: 500 }
    );
  }
}
