import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { prisma } from "../server/lib/prisma.js";

const ADMIN = {
  name: "Admin",
  username: process.env.ADMIN_USERNAME ?? "admin",
  role: UserRole.ADMIN,
};

const PLAYERS = [
  { name: "Aleksander Klonowski", username: "olek" },
  { name: "Bartek Buca", username: "bartek" },
  { name: "Igor Sielaczek", username: "igor" },
  { name: "Juliusz Maklakiewicz", username: "juliusz" },
  { name: "Kuba Benramdane", username: "kuba" },
  { name: "Mateusz Turowski", username: "mateusz" },
  { name: "Michal Lewandowski", username: "michal" },
  { name: "Michal Niemiec", username: "mniemiec" },
  { name: "Piotr Kulpa", username: "piotr" },
];

export async function seedUsers() {
  const adminPassword = process.env.ADMIN_PASSWORD ?? "atosms2026";
  const playerPassword = process.env.SEED_PASSWORD ?? "atos";
  const hashedAdmin = await bcrypt.hash(adminPassword, 12);
  const hashedPlayer = await bcrypt.hash(playerPassword, 12);

  const keepUsernames = new Set([
    ADMIN.username,
    ...PLAYERS.map((p) => p.username),
  ]);

  const toRemove = await prisma.user.findMany({
    where: { username: { notIn: [...keepUsernames] } },
    select: { id: true, username: true },
  });

  if (toRemove.length > 0) {
    await prisma.user.deleteMany({
      where: { id: { in: toRemove.map((u) => u.id) } },
    });
    console.log(`Usunięto ${toRemove.length} starych kont: ${toRemove.map((u) => u.username).join(", ")}`);
  }

  await prisma.user.upsert({
    where: { username: ADMIN.username },
    update: { name: ADMIN.name, password: hashedAdmin, role: UserRole.ADMIN },
    create: {
      name: ADMIN.name,
      username: ADMIN.username,
      password: hashedAdmin,
      role: UserRole.ADMIN,
    },
  });

  for (const player of PLAYERS) {
    await prisma.user.upsert({
      where: { username: player.username },
      update: {
        name: player.name,
        password: hashedPlayer,
        role: UserRole.USER,
      },
      create: {
        name: player.name,
        username: player.username,
        password: hashedPlayer,
        role: UserRole.USER,
      },
    });
  }

  console.log(`✅ Seed zakończony: 1 admin + ${PLAYERS.length} graczy.`);
  console.log(`   Admin: login "${ADMIN.username}" (hasło z ADMIN_PASSWORD)`);
  console.log(`   Gracze: hasło z SEED_PASSWORD`);
}

const isDirectRun = process.argv[1] === fileURLToPath(import.meta.url);

if (isDirectRun) {
  seedUsers()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
