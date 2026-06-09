import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Medal } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../contexts/AuthContext";
import { getShortName, orderUsersForTipsTable } from "@shared/display-names";
import { abbreviateTeam } from "@shared/team-abbrev";

type LeaderboardUser = {
  id: string;
  name: string;
  username: string;
  totalPoints: number;
};

type LeaderboardMatch = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  kickoffTime: string;
  stage: string | null;
};

type Prediction = {
  userId: string;
  matchId: string;
  predictedHomeScore: number;
  predictedAwayScore: number;
  pointsEarned: number | null;
};

type LeaderboardData = {
  users: LeaderboardUser[];
  matches: LeaderboardMatch[];
  predictions: Prediction[];
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function PredictionCell({
  prediction,
  finished,
}: {
  prediction?: Prediction;
  finished: boolean;
}) {
  if (!prediction) {
    return <span className="text-[10px] text-white/25 sm:text-sm">—</span>;
  }

  const score = `${prediction.predictedHomeScore}:${prediction.predictedAwayScore}`;

  if (finished && prediction.pointsEarned != null) {
    const color =
      prediction.pointsEarned === 3
        ? "text-green-400"
        : prediction.pointsEarned === 1
          ? "text-yellow-400"
          : "text-red-400";

    return (
      <div className="flex flex-col items-center gap-0 leading-none sm:gap-0.5">
        <span className="text-[10px] font-bold sm:text-sm">{score}</span>
        <span className={`text-[9px] font-semibold sm:text-xs sm:font-medium ${color}`}>
          +{prediction.pointsEarned}
        </span>
      </div>
    );
  }

  return <span className="text-[10px] font-bold sm:text-sm">{score}</span>;
}

function MatchLabel({
  homeTeam,
  awayTeam,
  stage,
  kickoffTime,
}: {
  homeTeam: string;
  awayTeam: string;
  stage: string | null;
  kickoffTime: string;
}) {
  const shortDate = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "numeric",
  }).format(new Date(kickoffTime));

  return (
    <>
      {/* Mobile — kompaktowo */}
      <div className="sm:hidden leading-tight">
        <p className="text-[10px] font-bold leading-none">{abbreviateTeam(homeTeam)}</p>
        <p className="my-0.5 text-[8px] text-white/35">–</p>
        <p className="text-[10px] font-bold leading-none">{abbreviateTeam(awayTeam)}</p>
        <p className="mt-1 text-[8px] text-white/40">{shortDate}</p>
      </div>
      {/* Desktop */}
      <div className="hidden sm:block">
        <p className="font-medium whitespace-nowrap">
          {homeTeam} vs {awayTeam}
        </p>
        <p className="text-xs text-white/40">
          {stage} · {formatDate(kickoffTime)}
        </p>
      </div>
    </>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  useEffect(() => {
    api<LeaderboardData>("/leaderboard")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const predictionMap = useMemo(() => {
    const map = new Map<string, Prediction>();
    data?.predictions.forEach((p) => map.set(`${p.userId}:${p.matchId}`, p));
    return map;
  }, [data?.predictions]);

  const tipUsers = useMemo(
    () => (data ? orderUsersForTipsTable(data.users) : []),
    [data?.users],
  );

  if (loading) {
    return <p className="text-white/60">Ładowanie rankingu…</p>;
  }

  if (!data) {
    return <p className="text-white/60">Nie udało się załadować rankingu.</p>;
  }

  const { users, matches } = data;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Ranking</h2>
        <p className="text-white/60">Klasyfikacja i wszystkie typy graczy</p>
      </div>

      {/* Tabela punktów */}
      <div className="card-pitch overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-white/10 bg-white/5 text-sm uppercase tracking-wide text-white/50">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Gracz</th>
              <th className="px-4 py-3 text-right">Punkty</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, index) => {
              const rank = index + 1;
              const isMe = u.id === user?.id;

              return (
                <tr
                  key={u.id}
                  className={`border-b border-white/5 ${isMe ? "bg-[var(--gold)]/10" : ""}`}
                >
                  <td className="px-4 py-3 font-mono text-white/60">
                    <span className="flex items-center gap-1">
                      {rank <= 3 && (
                        <Medal
                          className={`h-4 w-4 ${
                            rank === 1
                              ? "text-yellow-400"
                              : rank === 2
                                ? "text-gray-300"
                                : "text-amber-600"
                          }`}
                        />
                      )}
                      {rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {u.name}
                    {isMe && <span className="ml-2 text-xs text-[var(--gold)]">(Ty)</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-xl font-bold text-[var(--gold)]">
                    {u.totalPoints}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Macierz typów: mecze × gracze */}
      {matches.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-[var(--gold)]">Tabela typów</h3>
          <p className="text-sm text-white/50">
            Kto co obstawił. Po zakończeniu meczu widać zdobyte punkty (+3 / +1 / +0).
          </p>
          <p className="text-xs text-white/40 sm:hidden">Przesuń tabelę w bok, aby zobaczyć wszystkich graczy →</p>
          <div className="card-pitch overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
            <table className="w-full min-w-[22rem] text-left text-sm sm:min-w-[640px]">
              <thead className="border-b border-white/10 bg-white/5 text-white/50">
                <tr>
                  <th className="sticky left-0 z-10 w-[3.25rem] min-w-[3.25rem] bg-[#0a3d22] px-1 py-2 text-[9px] uppercase sm:w-auto sm:min-w-0 sm:px-3 sm:py-3 sm:text-xs">
                    Mecz
                  </th>
                  {tipUsers.map((u) => (
                    <th
                      key={u.id}
                      className="w-9 min-w-9 px-0.5 py-2 text-center text-[9px] font-medium sm:w-auto sm:min-w-0 sm:px-3 sm:py-3 sm:text-xs sm:whitespace-nowrap"
                    >
                      <span className="sm:hidden">{getShortName(u).slice(0, 4)}</span>
                      <span className="hidden sm:inline">{getShortName(u)}</span>
                    </th>
                  ))}
                  <th className="w-9 min-w-9 px-0.5 py-2 text-center text-[9px] uppercase sm:w-auto sm:min-w-0 sm:px-3 sm:py-3 sm:text-xs">
                    W
                  </th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => {
                  const finished = match.status === "FINISHED";
                  return (
                    <tr key={match.id} className="border-b border-white/5">
                      <td className="sticky left-0 z-10 w-[3.25rem] min-w-[3.25rem] bg-[#0a3d22]/95 px-1 py-1.5 sm:w-auto sm:min-w-0 sm:px-3 sm:py-3">
                        <MatchLabel
                          homeTeam={match.homeTeam}
                          awayTeam={match.awayTeam}
                          stage={match.stage}
                          kickoffTime={match.kickoffTime}
                        />
                      </td>
                      {tipUsers.map((u) => (
                        <td
                          key={u.id}
                          className="w-9 min-w-9 px-0.5 py-1.5 text-center sm:w-auto sm:min-w-0 sm:px-3 sm:py-3"
                        >
                          <PredictionCell
                            prediction={predictionMap.get(`${u.id}:${match.id}`)}
                            finished={finished}
                          />
                        </td>
                      ))}
                      <td className="w-9 min-w-9 px-0.5 py-1.5 text-center text-[10px] font-bold text-[var(--gold)] sm:px-3 sm:py-3 sm:text-sm">
                        {finished ? `${match.homeScore}:${match.awayScore}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Szczegóły per gracz */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-[var(--gold)]">Typy graczy</h3>
        <div className="space-y-2">
          {tipUsers.map((u) => {
            const userPredictions = matches
              .map((m) => ({
                match: m,
                prediction: predictionMap.get(`${u.id}:${m.id}`),
              }))
              .filter((entry) => entry.prediction);

            const isExpanded = expandedUser === u.id;
            const isMe = u.id === user?.id;

            return (
              <div key={u.id} className="card-pitch overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedUser(isExpanded ? null : u.id)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/5"
                >
                  <span className="font-medium">
                    {u.name}
                    {isMe && <span className="ml-2 text-xs text-[var(--gold)]">(Ty)</span>}
                    <span className="ml-3 text-sm text-white/40">
                      {userPredictions.length} typów · {u.totalPoints} pkt
                    </span>
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-white/50" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-white/50" />
                  )}
                </button>

                {isExpanded && (
                  <div className="border-t border-white/10 px-4 py-3">
                    {userPredictions.length === 0 ? (
                      <p className="text-sm text-white/40">Brak typów</p>
                    ) : (
                      <ul className="space-y-2">
                        {userPredictions.map(({ match, prediction }) => {
                          const finished = match.status === "FINISHED";
                          return (
                            <li
                              key={match.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm"
                            >
                              <div>
                                <span className="font-medium">
                                  {match.homeTeam} vs {match.awayTeam}
                                </span>
                                <span className="ml-2 text-white/40">{match.stage}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold">
                                  Typ: {prediction!.predictedHomeScore}:{prediction!.predictedAwayScore}
                                </span>
                                {finished && (
                                  <>
                                    <span className="text-white/40">
                                      Wynik: {match.homeScore}:{match.awayScore}
                                    </span>
                                    <span
                                      className={`font-semibold ${
                                        prediction!.pointsEarned === 3
                                          ? "text-green-400"
                                          : prediction!.pointsEarned === 1
                                            ? "text-yellow-400"
                                            : "text-red-400"
                                      }`}
                                    >
                                      +{prediction!.pointsEarned} pkt
                                    </span>
                                  </>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="card-pitch p-4 text-sm text-white/60">
        <p className="font-medium text-white/80">Zasady punktacji:</p>
        <ul className="mt-2 list-inside list-disc space-y-1">
          <li>3 punkty — dokładny wynik meczu</li>
          <li>1 punkt — poprawny wynik (zwycięzca lub remis), ale zły wynik bramkowy</li>
          <li>0 punktów — błędny typ</li>
        </ul>
      </div>
    </div>
  );
}
