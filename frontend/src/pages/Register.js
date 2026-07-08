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
            Create access for your project workspace.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-slate-300">
            Register a role-based operator file to log daily progress checklists, audit material assets, dispatch teams, and inspect budgets.
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

      {/* Right Register Console Panel */}
      <div className="relative z-10 flex flex-1 items-center justify-center p-6 sm:p-10">
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

          <h2 className="text-2xl font-extrabold font-industry uppercase tracking-wider text-blueprint-navy">REGISTER CREW PASS</h2>
          <p className="mt-1 text-xs font-medium text-blueprint-navy/60 uppercase tracking-wide">Create your role-based operations account.</p>

          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-xs font-bold font-industry uppercase tracking-wider text-blueprint-navy/70">Full Name</label>
              <input
                className="form-control"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold font-industry uppercase tracking-wider text-blueprint-navy/70">Email Address</label>
              <input
                className="form-control"
                type="email"
                placeholder="you@buildtrack.com"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold font-industry uppercase tracking-wider text-blueprint-navy/70">Role</label>
              <select
                className="form-control"
                value={form.role}
                onChange={(e) => updateField("role", e.target.value)}
                required
              >
                <option value="">Select Role</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role.split(" ").map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold font-industry uppercase tracking-wider text-blueprint-navy/70">Password</label>
                <input
                  className="form-control"
                  type="password"
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold font-industry uppercase tracking-wider text-blueprint-navy/70">Confirm</label>
                <input
                  className="form-control"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-none border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700">
                <Icon name="warning" className="h-4 w-4 shrink-0" />
                <span>{error.toUpperCase()}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full rounded-none py-3 animate-pulse"
              disabled={loading}
            >
              {loading ? "Creating Pass..." : "Submit Registration Pass"}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs font-bold uppercase tracking-wider font-industry text-blueprint-navy/60">
            Already registered? <Link className="text-safety-orange hover:text-[#d96b14] underline" to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
