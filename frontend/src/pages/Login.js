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
    { role: "Admin", email: "admin@buildtrack.com", password: "admin123", color: "border-blueprint-navy/30 bg-blueprint-navy/5 text-blueprint-navy hover:bg-blueprint-navy/10" },
    { role: "Project Manager", email: "manager@buildtrack.com", password: "manager123", color: "border-safety-orange/30 bg-safety-orange/5 text-safety-orange hover:bg-safety-orange/10" },
    { role: "Site Engineer", email: "engineer@buildtrack.com", password: "engineer123", color: "border-safety-yellow/40 bg-safety-yellow/5 text-blueprint-navy hover:bg-safety-yellow/15" },
    { role: "Accountant", email: "accountant@buildtrack.com", password: "accountant123", color: "border-concrete-gray/30 bg-concrete-gray/5 text-concrete-gray hover:bg-concrete-gray/10" },
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
    <div className="flex min-h-screen bg-[#F7F5F0] font-sans">
      {/* Left Blueprint Graphic Panel */}
      <div className="relative hidden w-5/12 flex-col justify-between overflow-hidden border-r border-blueprint-navy/20 bg-blueprint-navy p-12 text-white lg:flex">
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:24px_24px]" />
        
        <div className="z-10 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-none bg-safety-orange text-white shadow-md">
            <Icon name="building" className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold font-industry uppercase tracking-widest text-white">BuildTrack</span>
        </div>

        <div className="z-10 max-w-md">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-safety-orange font-industry">CONSTRUCTION OPERATIONS HUB</p>
          <h1 className="text-4xl font-extrabold leading-tight text-white font-industry uppercase tracking-wide">
            Keep every project, crew, and cost on track.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-slate-300">
            A secure site ERP designed to coordinate project sequencing, track material metrics, manage site workforce registries, and audit operational ledger books.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {["PROJECTS", "WORKFORCE", "LEDGER"].map((item) => (
              <div key={item} className="rounded-none border border-white/10 bg-white/5 px-3 py-2 text-center text-[10px] font-bold font-industry uppercase tracking-wider text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="z-10 text-[10px] text-[#8E9AA6] uppercase font-industry tracking-wider">© 2026 BuildTrack ERP Systems</p>
      </div>

      {/* Right Login Console Panel */}
      <div className="relative z-10 flex flex-1 items-center justify-center p-6 sm:p-10">
        {/* Subtle grid background on right as well */}
        <div className="absolute inset-0 grid-paper opacity-[0.4] pointer-events-none" />

        <div className="w-full max-w-md crop-panel bg-white p-8 shadow-lg transition-all duration-300 hover:border-blueprint-navy/30 sm:p-10">
          <div className="mb-6 lg:hidden">
            <div className="flex items-center gap-3 text-blueprint-navy">
              <span className="flex h-9 w-9 items-center justify-center rounded-none bg-safety-orange text-white shadow-sm">
                <Icon name="building" className="h-4 w-4" />
              </span>
              <span className="text-lg font-bold font-industry uppercase tracking-widest">BuildTrack</span>
            </div>
          </div>

          <h2 className="text-2xl font-extrabold font-industry uppercase tracking-wider text-blueprint-navy">SECURE ENTRY</h2>
          <p className="mt-1 text-xs font-medium text-blueprint-navy/60 uppercase tracking-wide">Access your site operations dashboard.</p>

          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-xs font-bold font-industry uppercase tracking-wider text-blueprint-navy/70">Email Address</label>
              <input
                className="form-control"
                type="email"
                placeholder="you@buildtrack.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold font-industry uppercase tracking-wider text-blueprint-navy/70">Password</label>
              <input
                className="form-control"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-none border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700">
                <Icon name="warning" className="h-4 w-4 shrink-0" />
                <span>{error.toUpperCase()}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-none py-3"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Login to dashboard"}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs font-bold uppercase tracking-wider font-industry text-blueprint-navy/60">
            New to BuildTrack? <Link className="text-safety-orange hover:text-[#d96b14] underline" to="/register">Register pass</Link>
          </p>

          {/* Quick Login Section */}
          <div className="mt-8 border-t border-blueprint-navy/15 pt-6">
            <p className="mb-3 text-[10px] font-extrabold uppercase tracking-widest text-[#8E9AA6] font-industry">QUICK LOGIN (DEMO ROLES)</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleDemoClick(acc)}
                  className={`flex flex-col items-start rounded-none border p-2.5 text-left transition-all duration-200 ${acc.color} active:scale-[0.97]`}
                >
                  <span className="text-[10px] font-bold font-industry uppercase tracking-wider">{acc.role}</span>
                  <span className="mt-1 w-full truncate text-[9px] font-mono opacity-80">{acc.email}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-center text-[9px] font-bold font-industry uppercase tracking-wider text-blueprint-navy/40">
              Role-based APIs and JWT access controls active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
