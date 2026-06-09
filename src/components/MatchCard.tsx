import { FormEvent, useEffect, useState } from "react";
import { Clock, Lock, CheckCircle2 } from "lucide-react";
import { canBetOnMatch } from "@shared/scoring";
import { TeamWithFlag } from "./TeamWithFlag";

export type MatchData = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  kickoffTime: string;
  status: string;
  stage: string | null;
  homeScore: number | null;
  awayScore: number | null;
  prediction: {
    predictedHomeScore: number;
    predictedAwayScore: number;
    pointsEarned: number | null;
  } | null;
};

type Props = {
  match: MatchData;
  onSave: (matchId: string, home: number, away: number) => Promise<void>;
};

function formatKickoff(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function MatchCard({ match, onSave }: Props) {
  const [now, setNow] = useState(() => new Date());
  const kickoff = new Date(match.kickoffTime);
  const locked = !canBetOnMatch(match.status, kickoff, now);
  const finished = match.status === "FINISHED";

  useEffect(() => {
    if (locked) return;
    const msToKickoff = kickoff.getTime() - Date.now();
    const intervalMs = msToKickoff <= 5 * 60 * 1000 ? 1_000 : 30_000;
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [match.kickoffTime, match.status, locked]);

  const [home, setHome] = useState(match.prediction?.predictedHomeScore ?? 0);
  const [away, setAway] = useState(match.prediction?.predictedAwayScore ?? 0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (locked) return;
    setSaving(true);
    setMessage("");
    try {
      await onSave(match.id, home, away);
      setMessage("Typ zapisany!");
    } catch {
      setMessage("Nie udało się zapisać typu.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="card-pitch p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-white/60">
        <span>{match.stage ?? "Mecz"}</span>
        <span className="flex items-center gap-1">
          {locked ? <Lock className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
          {formatKickoff(match.kickoffTime)}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
        <div className="flex flex-col items-center gap-1">
          <TeamWithFlag
            name={match.homeTeam}
            layout="stack"
            flagWidth={28}
            nameClassName="text-lg font-bold sm:text-xl"
          />
          {finished && (
            <p className="text-3xl font-black text-[var(--gold)]">{match.homeScore}</p>
          )}
        </div>
        <span className="text-white/40">vs</span>
        <div className="flex flex-col items-center gap-1">
          <TeamWithFlag
            name={match.awayTeam}
            layout="stack"
            flagWidth={28}
            nameClassName="text-lg font-bold sm:text-xl"
          />
          {finished && (
            <p className="text-3xl font-black text-[var(--gold)]">{match.awayScore}</p>
          )}
        </div>
      </div>

      {finished && match.prediction?.pointsEarned != null && (
        <p className="mb-3 flex items-center justify-center gap-1 text-sm text-[var(--gold)]">
          <CheckCircle2 className="h-4 w-4" />
          Zdobyte punkty: {match.prediction.pointsEarned}
        </p>
      )}

      {!finished && (
        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={20}
              value={home}
              onChange={(e) => setHome(Number(e.target.value))}
              disabled={locked}
              className="input-score"
              aria-label={`Bramki ${match.homeTeam}`}
            />
            <span className="text-white/50">:</span>
            <input
              type="number"
              min={0}
              max={20}
              value={away}
              onChange={(e) => setAway(Number(e.target.value))}
              disabled={locked}
              className="input-score"
              aria-label={`Bramki ${match.awayTeam}`}
            />
          </div>

          {locked ? (
            <p className="text-sm text-white/50">Typowanie zablokowane — mecz się rozpoczął</p>
          ) : (
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Zapisywanie…" : match.prediction ? "Zaktualizuj typ" : "Zapisz typ"}
            </button>
          )}

          {message && <p className="text-sm text-[var(--gold)]">{message}</p>}
        </form>
      )}
    </article>
  );
}
