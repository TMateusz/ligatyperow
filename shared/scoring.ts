export type ScoreInput = {
  predictedHome: number;
  predictedAway: number;
  actualHome: number;
  actualAway: number;
};

export const SCORING = {
  EXACT: 3,
  OUTCOME: 1,
  WRONG: 0,
} as const;

export type MatchOutcome = "home" | "away" | "draw";

export function getOutcome(home: number, away: number): MatchOutcome {
  if (home > away) return "home";
  if (away > home) return "away";
  return "draw";
}

export function calculatePoints(input: ScoreInput): number {
  const { predictedHome, predictedAway, actualHome, actualAway } = input;

  if (predictedHome === actualHome && predictedAway === actualAway) {
    return SCORING.EXACT;
  }

  if (getOutcome(predictedHome, predictedAway) === getOutcome(actualHome, actualAway)) {
    return SCORING.OUTCOME;
  }

  return SCORING.WRONG;
}

export function isMatchLocked(kickoffTime: Date, now: Date = new Date()): boolean {
  return now >= kickoffTime;
}

export function canBetOnMatch(
  status: string,
  kickoffTime: Date,
  now: Date = new Date()
): boolean {
  return status === "PENDING" && !isMatchLocked(kickoffTime, now);
}
