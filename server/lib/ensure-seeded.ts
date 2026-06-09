import { seedUsers } from "../../prisma/seed.js";
import { prisma } from "./prisma.js";

/** Przy pierwszym uruchomieniu tworzy konta użytkowników (pusta baza). */
export async function ensureSeeded() {
  const count = await prisma.user.count();
  if (count > 0) return;

  console.log("Pusta baza danych — tworzę użytkowników…");
  await seedUsers();
}
