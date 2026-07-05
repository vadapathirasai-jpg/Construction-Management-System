import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Icon } from "../components/UI";
import { useAppData } from "../context/AppData";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAppData();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    { role: "Admin", email: "admin@buildtrack.com", password: "admin123", color: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100" },
    { role: "Project Manager", email: "manager@buildtrack.com", password: "manager123", color: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
    { role: "Site Engineer", email: "engineer@buildtrack.com", password: "engineer123", color: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100" },
    { role: "Accountant", email: "accountant@buildtrack.com", password: "accountant123", color: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100" },
  ];

  const handleDemoClick = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      return setError("Please enter your email and password.");
    }
    setLoading(true);
    setError("");
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans">
      <div className="relative hidden w-5/12 flex-col justify-between overflow-hidden border-r border-slate-800 bg-slate-950 p-12 text-white lg:flex">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.16) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
        <div className="z-10 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-600 text-white shadow-lg shadow-primary-900/30">
            <Icon name="building" className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold text-white">BuildTrack</span>
        </div>

        <div className="z-10 max-w-md">
          <p className="mb-3 text-xs font-bold uppercase text-primary-300">Construction Operations Hub</p>
          <h1 className="text-4xl font-extrabold leading-tight text-white">
            Keep every project, team, and cost on track.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-slate-400">
            A secure enterprise workspace designed to streamline project schedules, track material logs, manage site workforces, and audit operational budgets.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {["Projects", "Workers", "Costs"].map((item) => <div key={item} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300">{item}</div>)}
          </div>
        </div>

        <p className="z-10 text-xs text-slate-500">(c) 2026 BuildTrack ERP Systems</p>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-950/90 p-8 shadow-2xl shadow-black/50 transition-all duration-300 hover:border-slate-700 sm:p-10">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-600 text-white">
                <Icon name="building" className="h-4 w-4" />
              </span>
              <span className="text-lg font-bold">BuildTrack</span>
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-white">Sign In</h2>
          <p className="mt-2 text-sm text-slate-400">Access your role-based operations dashboard.</p>

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">Email address</label>
              <input
                className="w-full rounded-md border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 transition-all duration-200 focus:border-primary-500 focus:bg-slate-900 focus:ring-4 focus:ring-primary-900/40"
                type="email"
                placeholder="you@buildtrack.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">Password</label>
              <input
                className="w-full rounded-md border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 transition-all duration-200 focus:border-primary-500 focus:bg-slate-900 focus:ring-4 focus:ring-primary-900/40"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-md border border-red-950 bg-red-950/30 px-4 py-3 text-xs font-medium text-red-400">
                <Icon name="warning" className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-md border-none bg-primary-600 py-3 font-bold text-white shadow-lg shadow-primary-900/20 transition-all duration-150 hover:bg-primary-500 active:scale-[0.99]"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Login to dashboard"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            New to BuildTrack? <Link className="font-semibold text-primary-300 hover:text-primary-200" to="/register">Register</Link>
          </p>

          <div className="mt-8 border-t border-slate-800 pt-6">
            <p className="mb-3 text-xs font-bold uppercase text-slate-400">Quick Login (Demo Roles)</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleDemoClick(acc)}
                  className={`flex flex-col items-start rounded-md border p-2.5 text-left transition-all duration-200 ${acc.color} active:scale-[0.97]`}
                >
                  <span className="text-xs font-bold">{acc.role}</span>
                  <span className="mt-1 w-full truncate text-[10px] opacity-80">{acc.email}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-center text-[10px] text-slate-500">
              Role-based APIs and JWT authorization are enforced.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
