import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Icon } from "../components/UI";
import { useAppData } from "../context/AppData";

const blankForm = { name: "", email: "", password: "", confirmPassword: "" };

export default function Register() {
  const { register, resendVerification } = useAppData();
  const [form, setForm] = useState(blankForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [registeredEmail, setRegisteredEmail] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState("");

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.includes("@")) {
      return setError("Enter your name and email.");
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
      setRegisteredEmail(form.email);
    } else {
      setError(result.error);
    }
  };

  const handleResend = async () => {
    if (!registeredEmail) return;
    setResendLoading(true);
    setResendStatus("");
    const result = await resendVerification(registeredEmail);
    setResendLoading(false);
    if (result.success) {
      setResendCountdown(60);
      setResendStatus("Verification email resent successfully.");
    } else {
      setResendStatus(result.error || "Failed to resend verification email.");
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
            {registeredEmail ? "Verify your credentials." : "Create access for your project workspace."}
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-slate-300">
            {registeredEmail 
              ? "Ensure your security clearance by authenticating your registered email address before logging in to the command hub."
              : "Register a role-based operator file to log daily progress checklists, audit material assets, dispatch teams, and inspect budgets."}
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

          {registeredEmail ? (
            <>
              <h2 className="text-2xl font-extrabold font-industry uppercase tracking-wider text-blueprint-navy">VERIFICATION SENT</h2>
              <p className="mt-1 text-xs font-medium text-blueprint-navy/60 uppercase tracking-wide">Check your inbox to activate access.</p>
              
              <div className="mt-6 space-y-6">
                <div className="flex flex-col gap-3 rounded-none border border-blueprint-navy/10 bg-[#F7F5F0] p-4 text-xs leading-relaxed text-blueprint-navy/80">
                  <p>
                    We have sent a verification link to <strong className="text-blueprint-navy font-bold">{registeredEmail}</strong>. 
                    Please click the link in that email to activate your account.
                  </p>
                  <p className="text-[10px] text-blueprint-navy/60 italic border-t border-blueprint-navy/5 pt-2">
                    Make sure to check your spam folder if you do not receive it in a few minutes.
                  </p>
                </div>

                {resendStatus && (
                  <div className={`flex items-center gap-2 rounded-none border px-4 py-2.5 text-xs font-bold ${
                    resendStatus.includes("successfully") 
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700" 
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}>
                    <Icon name={resendStatus.includes("successfully") ? "check" : "warning"} className="h-4 w-4 shrink-0" />
                    <span>{resendStatus.toUpperCase()}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    type="button"
                    className="w-full rounded-none py-3"
                    disabled={resendLoading || resendCountdown > 0}
                    onClick={handleResend}
                  >
                    {resendLoading 
                      ? "RESENDING..." 
                      : resendCountdown > 0 
                        ? `RESEND AVAILABLE IN ${resendCountdown}S` 
                        : "RESEND VERIFICATION EMAIL"}
                  </Button>

                  <Link to="/login" className="block w-full">
                    <Button variant="secondary" className="w-full rounded-none py-3">
                      Return to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold font-industry uppercase tracking-wider text-blueprint-navy">REGISTER CREW PASS</h2>
              <p className="mt-1 text-xs font-medium text-blueprint-navy/60 uppercase tracking-wide">Create your role-based operations account.</p>
              <p className="mt-2 text-xs font-semibold text-blueprint-navy/70 bg-[#F7F5F0] border border-blueprint-navy/10 p-3">
                Your account starts with Site Engineer access. An administrator can upgrade your role after registration.
              </p>

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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
