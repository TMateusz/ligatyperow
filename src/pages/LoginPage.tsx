import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    try {
      await login(String(form.get("username")), String(form.get("password")));
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd logowania");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 pt-12">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gold)]/20">
          <Trophy className="h-8 w-8 text-[var(--gold)]" />
        </div>
        <h1 className="text-3xl font-bold">Liga Typerów</h1>
        <p className="mt-2 text-white/70">Zaloguj się, aby typować wyniki MŚ 2026</p>
      </div>

      <form onSubmit={handleSubmit} className="card-pitch flex flex-col gap-4 p-6">
        <div>
          <label htmlFor="username" className="mb-1 block text-sm font-medium">
            Login
          </label>
          <input
            id="username"
            name="username"
            required
            autoComplete="username"
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 outline-none focus:border-[var(--gold)]"
            placeholder="np. jan"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Hasło
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 outline-none focus:border-[var(--gold)]"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Logowanie…" : "Zaloguj się"}
        </button>
      </form>

      <p className="text-center text-xs text-white/40">
        Dostęp tylko dla zaproszonych uczestników ligi.
      </p>
    </div>
  );
}
