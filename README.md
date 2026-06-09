# Liga Typerów — MŚ 2026 ⚽

Prywatna liga typerska na Mistrzostwa Świata 2026 (10 znajomych).

## Stack

- **React 19** + Vite + TypeScript
- **Express** (API backend)
- **SQLite** + Prisma ORM
- **Tailwind CSS 4** + Lucide React
- **Docker** (opcjonalnie)

## Szybki start (lokalnie)

### 1. Wymagania

- [Node.js](https://nodejs.org/) 20+ (z npm)

### 2. Instalacja

```powershell
cd C:\Users\MATEU\Downloads\ligatyperow
Copy-Item .env.example .env
npm install
```

### 3. Edytuj `.env`

```env
DATABASE_URL="file:./data/ligatyperow.db"
JWT_SECRET="twoj-losowy-klucz-min-32-znaki"
ADMIN_PASSWORD="TwojeHasloAdmina"
SEED_PASSWORD="worldcup2026"
```

### 4. Utwórz bazę i użytkowników

```powershell
npm run db:setup
```

### 5. Uruchom

```powershell
npm run dev
```

- Frontend React: **http://localhost:5173**
- API Express: **http://localhost:3001** (Vite proxy'uje `/api`)

### 6. Zaloguj się

| Kto | Login | Hasło |
|-----|-------|-------|
| Admin | `admin` | z `ADMIN_PASSWORD` |
| Znajomi | `jan`, `piotr`… | z `SEED_PASSWORD` |

## Docker

```powershell
Copy-Item .env.example .env
docker compose up --build -d
docker compose --profile seed run --rm seed
```

Aplikacja: **http://localhost:3000**

Baza SQLite jest w wolumenie Docker (`sqlite_data`) — dane przetrwają restart.

## Struktura projektu

```
src/           → React (strony, komponenty)
server/        → Express API
shared/        → wspólna logika (punktacja)
prisma/        → schemat SQLite + seed
data/          → plik bazy ligatyperow.db (tworzony automatycznie)
```

## API-Football — terminarz i wyniki MŚ 2026

1. Załóż darmowe konto na [api-football.com](https://www.api-football.com/)
2. Skopiuj klucz API do `.env`:

```env
API_FOOTBALL_KEY="twój-klucz"
```

3. W panelu **Admin** kliknij **„Pobierz terminarz MŚ 2026”** (importuje ~104 mecze)
4. Wyniki aktualizują się **automatycznie co 30 min** (lub ręcznie: „Synchronizuj wyniki teraz”)

Z terminala:

```powershell
npm run import:fixtures
```

**Uwaga:** plan darmowy = 100 zapytań/dzień. Auto-sync co 30 min = ~48 zapytań/dzień.

## Punktacja

| Sytuacja | Punkty |
|----------|--------|
| Dokładny wynik | **3** |
| Poprawny wynik (zwycięzca/remis) | **1** |
| Błędny typ | **0** |

## Dostosowanie znajomych

Edytuj tablicę `FRIENDS` w `prisma/seed.ts`, potem:

```powershell
npm run db:seed
```
