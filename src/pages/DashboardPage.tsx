import { useEffect, useState } from "react";
import { api } from "../api/client";
import { MatchCard, type MatchData } from "../components/MatchCard";

export default function DashboardPage() {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<MatchData[]>("/matches")
      .then(setMatches)
      .finally(() => setLoading(false));
  }, []);

  async function savePrediction(matchId: string, home: number, away: number) {
    await api("/predictions", {
      method: "POST",
      body: JSON.stringify({
        matchId,
        predictedHomeScore: home,
        predictedAwayScore: away,
      }),
    });

    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? {
              ...m,
              prediction: {
                predictedHomeScore: home,
                predictedAwayScore: away,
                pointsEarned: m.prediction?.pointsEarned ?? null,
              },
            }
          : m
      )
    );
  }

  if (loading) {
    return <p className="text-white/60">Ładowanie meczów…</p>;
  }

  if (matches.length === 0) {
    return (
      <div className="card-pitch p-8 text-center text-white/60">
        Brak zaplanowanych meczów. Admin może dodać mecze w panelu administracyjnym.
      </div>
    );
  }

  const upcoming = matches.filter((m) => m.status === "PENDING");
  const finished = matches.filter((m) => m.status === "FINISHED");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mecze</h2>
        <p className="text-white/60">
          Typuj wyniki przed rozpoczęciem meczu. Dokładny wynik = 3 pkt, poprawny wynik = 1 pkt.
        </p>
      </div>

      {upcoming.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--gold)]">Nadchodzące mecze</h3>
          <div className="grid gap-4">
            {upcoming.map((match) => (
              <MatchCard key={match.id} match={match} onSave={savePrediction} />
            ))}
          </div>
        </section>
      )}

      {finished.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white/70">Zakończone mecze</h3>
          <div className="grid gap-4">
            {finished.map((match) => (
              <MatchCard key={match.id} match={match} onSave={savePrediction} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
