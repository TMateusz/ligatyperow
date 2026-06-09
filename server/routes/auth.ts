import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { requireAuth, signToken } from "../middleware/auth.js";

const router = Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Podaj login i hasło" });
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return res.status(401).json({ error: "Nieprawidłowy login lub hasło" });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: "Nieprawidłowy login lub hasło" });
  }

  const payload = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
  };

  res.json({ token: signToken(payload), user: payload });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, username: true, role: true, totalPoints: true },
  });

  if (!user) {
    return res.status(404).json({ error: "Użytkownik nie istnieje" });
  }

  res.json(user);
});

export default router;
