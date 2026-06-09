import { Router } from "express";
import { isApiFootballConfigured } from "../lib/api-football.js";
import { localizeMatch } from "../../shared/team-names.js";
import { setMatchResult } from "../lib/match-service.js";
import { prisma } from "../lib/prisma.js";
import {
  getSyncStatus,
  importWorldCupFixtures,
  syncMatchResults,
} from "../lib/sync-service.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/sync/status", (_req, res) => {
  res.json(getSyncStatus());
});

router.post("/sync/import", async (_req, res) => {
  try {
    const result = await importWorldCupFixtures();
    res.json(result);
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : "Błąd importu meczów",
    });
  }
});

router.post("/sync/now", async (_req, res) => {
  if (!isApiFootballConfigured()) {
    return res.status(400).json({ error: "Brak klucza API_FOOTBALL_KEY" });
  }

  try {
    const result = await syncMatchResults();
    res.json(result);
  } catch (e) {
    res.status(500).json({
      error: e instanceof Error ? e.message : "Błąd synchronizacji",
    });
  }
});

router.get("/matches", async (_req, res) => {
  const matches = await prisma.match.findMany({
    orderBy: { kickoffTime: "asc" },
  });

  res.json(
    matches.map((m) =>
      localizeMatch({
        ...m,
        kickoffTime: m.kickoffTime.toISOString(),
      })
    )
  );
});

router.post("/matches", async (req, res) => {
  const { homeTeam, awayTeam, kickoffTime, stage } = req.body;

  if (!homeTeam || !awayTeam || !kickoffTime) {
    return res.status(400).json({ error: "Uzupełnij wszystkie pola" });
  }

  const match = await prisma.match.create({
    data: {
      homeTeam: String(homeTeam),
      awayTeam: String(awayTeam),
      kickoffTime: new Date(kickoffTime),
      stage: stage ? String(stage) : null,
    },
  });

  res.json({ ...match, kickoffTime: match.kickoffTime.toISOString() });
});

router.patch("/matches/:id/teams", async (req, res) => {
  const { id } = req.params;
  const { homeTeam, awayTeam } = req.body;

  if (!homeTeam?.trim() || !awayTeam?.trim()) {
    return res.status(400).json({ error: "Podaj obie drużyny" });
  }

  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) {
    return res.status(404).json({ error: "Mecz nie istnieje" });
  }

  if (match.status === "FINISHED") {
    return res.status(409).json({ error: "Nie można zmienić drużyn po zakończeniu meczu" });
  }

  const updated = await prisma.match.update({
    where: { id },
    data: {
      homeTeam: String(homeTeam).trim(),
      awayTeam: String(awayTeam).trim(),
    },
  });

  res.json({ ...updated, kickoffTime: updated.kickoffTime.toISOString() });
});

router.post("/matches/:id/result", async (req, res) => {
  const { id } = req.params;
  const { homeScore, awayScore } = req.body;

  if (
    typeof homeScore !== "number" ||
    typeof awayScore !== "number" ||
    homeScore < 0 ||
    awayScore < 0
  ) {
    return res.status(400).json({ error: "Nieprawidłowy wynik" });
  }

  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) {
    return res.status(404).json({ error: "Mecz nie istnieje" });
  }

  const isCorrection = match.status === "FINISHED";

  await setMatchResult(id, homeScore, awayScore);
  res.json({ success: true, corrected: isCorrection });
});

export default router;
