import { Link, useLocation } from "react-router-dom";
import { LogOut, Shield, Trophy, LayoutDashboard } from "lucide-react";
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
    <header className="card-pitch flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--gold)]">MŚ 2026</p>
        <h1 className="text-xl font-bold sm:text-2xl">Liga Typerów</h1>
      </div>

      <nav className="flex flex-wrap items-center gap-2">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`btn-ghost text-sm ${
              pathname === to ? "border-[var(--gold)] text-[var(--gold)]" : ""
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
              pathname === "/admin" ? "border-[var(--gold)] text-[var(--gold)]" : ""
            }`}
          >
            <Shield className="h-4 w-4" />
            Admin
          </Link>
        )}

        <button onClick={logout} className="btn-ghost text-sm">
          <LogOut className="h-4 w-4" />
          Wyloguj ({user?.name})
        </button>
      </nav>
    </header>
  );
}
