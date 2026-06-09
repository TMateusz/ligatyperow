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

export function getDashboardMatchSortRank(
  match: { status: string; kickoffTime: Date | string },
  now: Date = new Date()
): number {
  if (match.status === "FINISHED") return 2;
  if (canBetOnMatch(match.status, new Date(match.kickoffTime), now)) return 0;
  return 1;
}

export function sortDashboardMatches<T extends { status: string; kickoffTime: Date | string }>(
  matches: T[],
  options: { finishedTab?: boolean; now?: Date } = {}
): T[] {
  const { finishedTab = false, now = new Date() } = options;

  if (finishedTab) {
    return [...matches].sort(
      (a, b) => new Date(b.kickoffTime).getTime() - new Date(a.kickoffTime).getTime()
    );
  }

  return [...matches].sort((a, b) => {
    const rankA = getDashboardMatchSortRank(a, now);
    const rankB = getDashboardMatchSortRank(b, now);
    if (rankA !== rankB) return rankA - rankB;
    return new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime();
  });
}
