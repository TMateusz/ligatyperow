import { Link, useLocation } from "react-router-dom";
import { LogOut, Shield, Trophy, LayoutDashboard, KeyRound } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const links = [
  { to: "/dashboard", label: "Mecze", icon: LayoutDashboard },
  { to: "/leaderboard", label: "Ranking", icon: Trophy },
];

export function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="card-pitch overflow-hidden p-0">
      <div className="h-1 bg-gradient-to-r from-[var(--wc-usa)] via-[var(--wc-gold)] to-[var(--wc-canada)]" />

      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--wc-gold)]/30 bg-gradient-to-br from-white/10 to-white/5">
            <Trophy className="h-6 w-6 text-[var(--wc-gold)]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-display text-xl font-bold leading-none tracking-wide text-white sm:text-2xl">
              Liga Typerów
            </p>
            <p className="text-[10px] font-semibold tracking-[0.25em] text-[var(--wc-gold)] sm:text-xs">
              FIFA WORLD CUP 26 · USA · CAN · MEX
            </p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`btn-ghost text-sm ${
                pathname === to ? "border-[var(--wc-gold)]/50 text-[var(--wc-gold)]" : ""
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}

          {isAdmin && (
            <Link
              to="/admin"
              className={`btn-ghost text-sm ${
                pathname === "/admin" ? "border-[var(--wc-gold)]/50 text-[var(--wc-gold)]" : ""
              }`}
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}

          <Link
            to="/settings"
            className={`btn-ghost text-sm ${
              pathname === "/settings" ? "border-[var(--wc-gold)]/50 text-[var(--wc-gold)]" : ""
            }`}
          >
            <KeyRound className="h-4 w-4" />
            Hasło
          </Link>

          <button onClick={logout} className="btn-ghost text-sm">
            <LogOut className="h-4 w-4" />
            <span className="max-w-[8rem] truncate">{user?.name}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
