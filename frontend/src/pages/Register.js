import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Icon } from "../components/UI";
import { useAppData } from "../context/AppData";
import { roleOptions } from "../data";

const blankForm = { name: "", email: "", password: "", confirmPassword: "", role: "" };

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAppData();
  const [form, setForm] = useState(blankForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.includes("@") || !form.role) {
      return setError("Enter your name, email, and role.");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }
    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    const { confirmPassword, ...user } = form;
    const result = await register(user);
    setLoading(false);

    if (result.success) {
      navigate("/login");
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
            Create access for your project workspace.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-slate-400">
            Register a role-based account to manage project schedules, site teams, material logs, and operating costs.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {["Projects", "Sites", "Reports"].map((item) => <div key={item} className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300">{item}</div>)}
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

          <h2 className="text-2xl font-extrabold text-white">Register</h2>
          <p className="mt-2 text-sm text-slate-400">Create your role-based operations account.</p>

          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">Full name</label>
              <input className="w-full rounded-md border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 transition-all duration-200 focus:border-primary-500 focus:bg-slate-900 focus:ring-4 focus:ring-primary-900/40" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">Email address</label>
              <input className="w-full rounded-md border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 transition-all duration-200 focus:border-primary-500 focus:bg-slate-900 focus:ring-4 focus:ring-primary-900/40" type="email" placeholder="you@buildtrack.com" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">Role</label>
              <select className="w-full rounded-md border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white transition-all duration-200 focus:border-primary-500 focus:bg-slate-900 focus:ring-4 focus:ring-primary-900/40" value={form.role} onChange={(e) => updateField("role", e.target.value)} required>
                <option value="">Select role</option>
                {roleOptions.map((role) => <option key={role}>{role}</option>)}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">Password</label>
                <input className="w-full rounded-md border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 transition-all duration-200 focus:border-primary-500 focus:bg-slate-900 focus:ring-4 focus:ring-primary-900/40" type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">Confirm</label>
                <input className="w-full rounded-md border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 transition-all duration-200 focus:border-primary-500 focus:bg-slate-900 focus:ring-4 focus:ring-primary-900/40" type="password" value={form.confirmPassword} onChange={(e) => updateField("confirmPassword", e.target.value)} required />
              </div>
            </div>

            {error && <div className="flex items-center gap-2 rounded-md border border-red-950 bg-red-950/30 px-4 py-3 text-xs font-medium text-red-400"><Icon name="warning" className="h-4 w-4" />{error}</div>}

            <Button type="submit" className="w-full rounded-md border-none bg-primary-600 py-3 font-bold text-white shadow-lg shadow-primary-900/20 transition-all duration-150 hover:bg-primary-500 active:scale-[0.99]" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already registered? <Link className="font-semibold text-primary-300 hover:text-primary-200" to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
