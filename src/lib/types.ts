export interface Goal {
  name: string;
  minute: string;
  penalty?: boolean;
  owngoal?: boolean;
}

export interface Score {
  ft: [number, number];
  ht: [number, number];
}

export interface Match {
  id: string;
  round: string;
  date: string;
  time?: string;
  team1: string;
  team2: string;
  score?: Score;
  goals1?: Goal[];
  goals2?: Goal[];
  group?: string;
  ground?: string;
  matchNumber?: number;
  hostCity?: string;
  matchUrl?: string;
}

export interface WorldCupData {
  name: string;
  matches: Match[];
}

export interface GroupStanding {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: ("W" | "D" | "L")[];
}

export interface GroupData {
  name: string;
  standings: GroupStanding[];
  matches: Match[];
}

export interface KnockoutRound {
  name: string;
  matches: Match[];
}

export interface Player {
  number: number;
  pos: string;
  name: string;
  club: { name: string; country: string };
  date_of_birth: string;
}

export interface Team {
  name: string;
  fifa_code: string;
  group: string;
  confed: string;
  continent: string;
  flag_icon: string;
  players: Player[];
}

export interface Stadium {
  name: string;
  city: string;
  cc: string;
  capacity: number;
  timezone: string;
  coords: string;
}
