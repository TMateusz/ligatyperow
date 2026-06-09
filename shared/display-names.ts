/** Krótka nazwa gracza w tabeli typów (nagłówki kolumn). */
export function getShortName(user: { name: string; username: string }): string {
  const byUsername: Record<string, string> = {
    olek: "Olek",
    piotr: "P.Piotr",
    mniemiec: "Niemiec",
    michal: "Bolec",
  };

  if (byUsername[user.username]) {
    return byUsername[user.username];
  }

  return user.name.split(" ")[0];
}

/** Kolejność kolumn w tabeli typów — Piotr Kulpa pierwszy. */
export function orderUsersForTipsTable<T extends { username: string }>(users: T[]): T[] {
  const piotr = users.find((u) => u.username === "piotr");
  if (!piotr) return users;
  return [piotr, ...users.filter((u) => u.username !== "piotr")];
}
