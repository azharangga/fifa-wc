"use client";

import { Trophy } from "lucide-react";
import Link from "next/link";
import { getCountryFlagUrl } from "@/lib/data";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useTranslation } from "../layout/language-provider";

interface ThirdPlaceTeam {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  groupName: string;
  form: ("W" | "D" | "L")[];
}

interface ThirdPlaceRankingProps {
  thirdPlaceStandings: ThirdPlaceTeam[];
}

export function ThirdPlaceRanking({ thirdPlaceStandings }: ThirdPlaceRankingProps) {
  const { t } = useTranslation();
  const isId = t("home") === "Beranda";

  if (thirdPlaceStandings.length === 0) return null;

  return (
    <div className="space-y-6 pt-12">
      <div className="flex items-center gap-3">
        <div
          className="p-2.5 flex items-center justify-center"
          style={{ backgroundColor: "var(--card)", borderRadius: "10px", border: "1px solid var(--border)" }}
        >
          <Trophy className="h-5 w-5" style={{ color: "var(--foreground)" }} />
        </div>
        <div>
          <h3
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 500,
              lineHeight: 1.13,
              letterSpacing: "-1px",
              color: "var(--foreground)",
            }}
          >
            {t("thirdPlaceTitle")}
          </h3>
          <p style={{ color: "var(--muted-foreground)", fontSize: "15px", fontWeight: 400, letterSpacing: "-0.15px", marginTop: "4px" }}>
            {t("thirdPlaceDesc")}
          </p>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          overflow: "hidden",
          padding: "24px 0",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full" style={{ minWidth: "550px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)", fontSize: "12px", fontWeight: 500 }}>
                <th className="text-center pb-3" style={{ paddingLeft: "24px", paddingRight: "16px", width: "64px" }}>#</th>
                <th className="text-left pb-3 pr-2">{t("team")}</th>
                <th className="text-center pb-3 px-1 w-16">{t("group")}</th>
                <th className="text-center pb-3 px-1 w-12">{t("tableMp")}</th>
                <th className="text-center pb-3 px-1 w-12">{t("tableW")}</th>
                <th className="text-center pb-3 px-1 w-12">{t("tableD")}</th>
                <th className="text-center pb-3 px-1 w-12">{t("tableL")}</th>
                <th className="text-center pb-3 px-1 w-12 hidden sm:table-cell">{t("tableGf")}</th>
                <th className="text-center pb-3 px-1 w-12 hidden sm:table-cell">{t("tableGa")}</th>
                <th className="text-center pb-3 px-1 w-16">{t("tableGd")}</th>
                <th className="text-center pb-3 px-1 md:pr-1 pr-6 w-12">{t("tablePts")}</th>
                <th className="text-center pb-3 pl-1 pr-6 w-32 hidden md:table-cell">{isId ? "Tren" : "Form"}</th>
              </tr>
            </thead>
            <tbody>
              {thirdPlaceStandings.map((team, idx) => {
                 const isQualifying = idx < 8; // Top 8 qualify
                 const flag = getCountryFlagUrl(team.team);
                 
                 // Form rendering helper
                 const last5 = team.form ? team.form.slice(-5) : [];
                 const formSlots = [...last5];
                 while (formSlots.length < 5) {
                   formSlots.unshift(null as any);
                 }

                 return (
                   <tr
                     key={team.team}
                     className="transition-colors hover:bg-[var(--hover-bg)]"
                     style={{
                       borderBottom: "1px solid var(--hairline-soft)",
                       backgroundColor: isQualifying ? "rgba(59, 130, 246, 0.06)" : "transparent",
                     }}
                   >
                     <td
                       className="py-3.5 text-center"
                       style={{
                         paddingLeft: "24px",
                         paddingRight: "16px",
                         width: "64px",
                         borderLeft: isQualifying
                           ? "4px solid #3b82f6"
                           : "4px solid transparent",
                       }}
                     >
                       <span
                         className="inline-flex items-center justify-center w-5 h-5"
                         style={{
                           borderRadius: "6px",
                           fontSize: "10px",
                           fontWeight: 700,
                           backgroundColor: isQualifying ? "var(--tint-border)" : "var(--tint-bg)",
                           color: isQualifying ? "var(--foreground)" : "var(--muted-foreground)",
                         }}
                       >
                         {idx + 1}
                       </span>
                     </td>
                     <td className="py-3.5 pr-2">
                       <div className="flex items-center gap-2">
                         <div
                           className="w-5 h-3.5 overflow-hidden shrink-0 flex items-center justify-center"
                           style={{ borderRadius: "3px", border: "1px solid var(--border)", backgroundColor: "var(--tint-bg)" }}
                         >
                           {flag ? (
                             // eslint-disable-next-line @next/next/no-img-element
                             <img src={flag} alt={team.team} className="w-full h-full object-cover select-none" />
                           ) : (
                             <span style={{ fontSize: "10px" }}>🏆</span>
                           )}
                         </div>
                         <Link
                           href={`/teams/${encodeURIComponent(team.team)}`}
                           className="truncate block hover:underline"
                           style={{ color: "var(--foreground)", fontSize: "14px", fontWeight: 700, letterSpacing: "-0.14px" }}
                         >
                           {team.team}
                         </Link>
                       </div>
                     </td>
                    <td
                      className="text-center py-3.5 px-1"
                      style={{ fontSize: "13px", fontWeight: 500, color: "var(--muted-foreground)" }}
                    >
                      {team.groupName.replace("Group ", "")}
                    </td>
                    {[team.played, team.won, team.drawn, team.lost].map((val, i) => (
                      <td
                        key={i}
                        className="text-center py-3.5 px-1"
                        style={{
                          fontSize: "13px",
                          fontFeatureSettings: '"tnum"',
                          color: i === 0 ? "var(--muted-foreground)" : i === 1 ? "var(--foreground)" : "var(--muted-foreground)",
                          fontWeight: i === 1 ? 700 : 500,
                        }}
                      >
                        {val}
                      </td>
                    ))}
                    <td
                      className="text-center py-3.5 px-1 hidden sm:table-cell"
                      style={{ fontSize: "13px", fontWeight: 500, color: "var(--muted-foreground)", fontFeatureSettings: '"tnum"' }}
                    >
                      {team.goalsFor}
                    </td>
                    <td
                      className="text-center py-3.5 px-1 hidden sm:table-cell"
                      style={{ fontSize: "13px", fontWeight: 500, color: "var(--muted-foreground)", fontFeatureSettings: '"tnum"' }}
                    >
                      {team.goalsAgainst}
                    </td>
                    <td
                      className="text-center py-3.5 px-1"
                      style={{ fontSize: "13px", fontWeight: 700, color: "var(--foreground)", fontFeatureSettings: '"tnum"' }}
                    >
                      {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                    </td>
                    <td
                      className="text-center py-3.5 px-1 md:pr-1 pr-6"
                      style={{ fontSize: "14px", fontWeight: 700, color: "var(--foreground)", fontFeatureSettings: '"tnum"' }}
                    >
                      {team.points}
                    </td>
                    <td className="py-3.5 px-1 pr-6 hidden md:table-cell">
                       <div className="flex items-center gap-1 justify-center">
                         {formSlots.map((res, sIdx) => {
                           if (!res) {
                             return (
                               <div
                                 key={sIdx}
                                 className="rounded-full flex items-center justify-center shrink-0"
                                 style={{
                                   border: "1.5px solid var(--muted-foreground)",
                                   opacity: 0.6,
                                   width: "18px",
                                   height: "18px",
                                   backgroundColor: "transparent",
                                 }}
                               />
                             );
                           }
                           const bg = res === "W" ? "#22c55e" : res === "L" ? "#ef4444" : "#94a3b8";
                            return (
                             <Tooltip key={sIdx}>
                               <TooltipTrigger asChild>
                                 <div
                                   className="rounded-full flex items-center justify-center shrink-0"
                                   style={{
                                     backgroundColor: bg,
                                     width: "18px",
                                     height: "18px",
                                     cursor: "help"
                                   }}
                                 >
                                   {res === "W" ? (
                                     <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                       <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                     </svg>
                                   ) : res === "L" ? (
                                     <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                       <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                     </svg>
                                   ) : (
                                     <div style={{ width: "6px", height: "2px", backgroundColor: "#ffffff", borderRadius: "1px" }} />
                                   )}
                                 </div>
                               </TooltipTrigger>
                               <TooltipContent>
                                 {res === "W" ? (isId ? "Menang" : "Win") : res === "L" ? (isId ? "Kalah" : "Loss") : (isId ? "Seri" : "Draw")}
                               </TooltipContent>
                             </Tooltip>
                           );
                         })}
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-1.5 mt-4" style={{ fontSize: "11px", color: "var(--muted-foreground)", fontWeight: 500, paddingLeft: "24px", paddingRight: "24px" }}>
          <div
            style={{
              height: "8px",
              width: "8px",
              borderRadius: "9999px",
              backgroundColor: "#3b82f6",
              border: "1px solid rgba(59, 130, 246, 0.4)",
            }}
          />
          <span>{isId ? "8 tim teratas lolos ke Babak 32 Besar" : "Top 8 teams qualify for the Round of 32"}</span>
        </div>
      </div>
    </div>
  );
}
