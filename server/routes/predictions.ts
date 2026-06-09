import { Router } from "express";
import { isMatchLocked } from "../../shared/scoring.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  const { matchId, predictedHomeScore, predictedAwayScore } = req.body;

  if (
    !matchId ||
    typeof predictedHomeScore !== "number" ||
    typeof predictedAwayScore !== "number" ||
    predictedHomeScore < 0 ||
    predictedAwayScore < 0
  ) {
    return res.status(400).json({ error: "Nieprawidłowe dane" });
  }

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    return res.status(404).json({ error: "Mecz nie istnieje" });
  }

  if (match.status !== "PENDING" || isMatchLocked(match.kickoffTime)) {
    return res.status(403).json({ error: "Typowanie zablokowane — mecz już się rozpoczął" });
  }

  const prediction = await prisma.prediction.upsert({
    where: {
      userId_matchId: { userId: req.user!.id, matchId },
    },
    update: { predictedHomeScore, predictedAwayScore },
    create: {
      userId: req.user!.id,
      matchId,
      predictedHomeScore,
      predictedAwayScore,
    },
  });

  res.json(prediction);
});

export default router;
