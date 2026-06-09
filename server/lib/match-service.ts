import { MatchStatus } from "@prisma/client";
import { calculatePoints } from "../../shared/scoring.js";
import { prisma } from "./prisma.js";

/** Zapisuje lub poprawia wynik meczu i przelicza punkty (różnica vs poprzedni wynik). */
export async function setMatchResult(
  matchId: string,
  homeScore: number,
  awayScore: number
) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    throw new Error("Mecz nie istnieje");
  }

  const predictions = await prisma.prediction.findMany({ where: { matchId } });

  await prisma.$transaction(async (tx) => {
    for (const prediction of predictions) {
      const oldPoints = prediction.pointsEarned ?? 0;
      const newPoints = calculatePoints({
        predictedHome: prediction.predictedHomeScore,
        predictedAway: prediction.predictedAwayScore,
        actualHome: homeScore,
        actualAway: awayScore,
      });

      const diff = newPoints - oldPoints;

      if (diff !== 0 || prediction.pointsEarned === null) {
        await tx.prediction.update({
          where: { id: prediction.id },
          data: { pointsEarned: newPoints },
        });

        if (diff !== 0) {
          await tx.user.update({
            where: { id: prediction.userId },
            data: { totalPoints: { increment: diff } },
          });
        }
      }
    }

    await tx.match.update({
      where: { id: matchId },
      data: { homeScore, awayScore, status: MatchStatus.FINISHED },
    });
  });
}
