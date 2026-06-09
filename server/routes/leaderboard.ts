import { Router } from "express";
import { UserRole } from "@prisma/client";
import { localizeMatch } from "../../shared/team-names.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (_req, res) => {
  const [users, matches, predictions] = await Promise.all([
    prisma.user.findMany({
      where: { role: UserRole.USER },
      orderBy: [{ totalPoints: "desc" }, { name: "asc" }],
      select: { id: true, name: true, username: true, totalPoints: true },
    }),
    prisma.match.findMany({
      orderBy: { kickoffTime: "asc" },
      select: {
        id: true,
        homeTeam: true,
        awayTeam: true,
        homeScore: true,
        awayScore: true,
        status: true,
        kickoffTime: true,
        stage: true,
      },
    }),
    prisma.prediction.findMany({
      where: { user: { role: UserRole.USER } },
      select: {
        userId: true,
        matchId: true,
        predictedHomeScore: true,
        predictedAwayScore: true,
        pointsEarned: true,
      },
    }),
  ]);

  res.json({
    users,
    matches: matches.map((m) =>
      localizeMatch({
        ...m,
        kickoffTime: m.kickoffTime.toISOString(),
      })
    ),
    predictions,
  });
});

export default router;
