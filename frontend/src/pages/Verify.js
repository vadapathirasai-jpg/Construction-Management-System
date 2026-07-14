import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Icon } from "../components/UI";
import { useAppData } from "../context/AppData";

export default function Verify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const { verifyUser, resendVerification } = useAppData();

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // 'idle', 'success', 'error'
  const [message, setMessage] = useState("");

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

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email.trim() || otp.trim().length !== 6) {
      setStatus("error");
      setMessage("Please enter a valid email and 6-digit OTP code.");
      return;
    }
    setLoading(true);
    setStatus("idle");
    setMessage("");
    const result = await verifyUser(email, otp);
    setLoading(false);
    if (result.success) {
      setStatus("success");
      setMessage(result.message || "Your account has been verified! You can now log in.");
    } else {
      setStatus("error");
      setMessage(result.error || "This verification code is invalid or has expired.");
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter your email address to resend the code.");
      return;
    }
    setResendLoading(true);
    setResendStatus("");
    const result = await resendVerification(email);
    setResendLoading(false);
    if (result.success) {
      setResendCountdown(60);
      setResendStatus("Verification code resent successfully.");
    } else {
      setResendStatus(result.error || "Failed to resend verification code.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F5F0] p-6 sm:p-10 font-sans relative">
      <div className="absolute inset-0 grid-paper opacity-[0.4] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md crop-panel bg-white p-8 shadow-lg transition-all duration-300 hover:border-blueprint-navy/35 sm:p-10">
        <div className="mb-6 flex items-center justify-center gap-3 text-blueprint-navy">
          <span className="flex h-10 w-10 items-center justify-center rounded-none bg-safety-orange text-white shadow-md">
            <Icon name="building" className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold font-industry uppercase tracking-widest">BuildTrack</span>
        </div>

        {status === "success" ? (
          <div className="py-4 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-600">
              <Icon name="check" className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-extrabold font-industry uppercase tracking-wider text-blueprint-navy">Account Verified</h2>
            <p className="mt-2 text-xs font-medium text-blueprint-navy/70 leading-relaxed uppercase">{message}</p>
            <div className="mt-8">
              <Button
                className="w-full rounded-none py-3"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold font-industry uppercase tracking-wider text-blueprint-navy">Verify Credentials</h2>
              <p className="mt-1 text-xs font-medium text-blueprint-navy/60 uppercase tracking-wide">Enter your email and the 6-digit OTP code.</p>
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold font-industry uppercase tracking-wider text-blueprint-navy/70">Email Address</label>
                <input
                  className="form-control"
                  type="email"
                  placeholder="you@buildtrack.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading || initialEmail !== ""}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold font-industry uppercase tracking-wider text-blueprint-navy/70">6-Digit Verification Code</label>
                <input
                  className="form-control text-center text-lg font-mono tracking-[10px] uppercase"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                  disabled={loading}
                />
              </div>

              {status === "error" && (
                <div className="flex items-center gap-2 rounded-none border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700 uppercase">
                  <Icon name="warning" className="h-4 w-4 shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full rounded-none py-3"
                disabled={loading || otp.length !== 6 || !email}
              >
                {loading ? "VERIFYING CODE..." : "VERIFY CODE"}
              </Button>
            </form>

            <div className="border-t border-blueprint-navy/10 pt-4 space-y-4">
              {resendStatus && (
                <div className={`flex items-center gap-2 rounded-none border px-4 py-2.5 text-xs font-bold uppercase ${
                  resendStatus.includes("successfully") 
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700" 
                    : "border-red-200 bg-red-50 text-red-700"
                }`}>
                  <Icon name={resendStatus.includes("successfully") ? "check" : "warning"} className="h-4 w-4 shrink-0" />
                  <span>{resendStatus}</span>
                </div>
              )}

              <Button
                type="button"
                variant="secondary"
                className="w-full rounded-none py-3"
                disabled={resendLoading || resendCountdown > 0}
                onClick={handleResend}
              >
                {resendLoading 
                  ? "RESENDING..." 
                  : resendCountdown > 0 
                    ? `RESEND AVAILABLE IN ${resendCountdown}S` 
                    : "RESEND OTP CODE"}
              </Button>

              <div className="flex flex-col gap-2 text-center pt-2">
                <Link to="/login" className="text-xs font-bold uppercase tracking-wider font-industry text-blueprint-navy/60 hover:text-blueprint-navy underline">
                  Back to Login
                </Link>
                <Link to="/register" className="text-xs font-bold uppercase tracking-wider font-industry text-safety-orange hover:text-[#d96b14] underline">
                  Need a new account? Register here
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
