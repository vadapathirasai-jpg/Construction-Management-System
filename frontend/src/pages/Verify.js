import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Icon } from "../components/UI";

const API_BASE = "http://localhost:8081";

export default function Verify() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState(() => (token ? "loading" : "error"));
  const [message, setMessage] = useState(() => (token ? "" : "No verification token found."));

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    let active = true;

    const verify = async () => {
      try {
        const response = await fetch(`${API_BASE}/users/verify?token=${encodeURIComponent(token)}`);
        const text = await response.text();
        if (!active) return;

        if (response.ok) {
          setStatus("success");
          setMessage(text || "Your account has been verified! You can now log in.");
        } else {
          setStatus("error");
          setMessage(text || "This verification link is invalid or has expired.");
        }
      } catch (err) {
        if (!active) return;
        setStatus("error");
        setMessage("A network error occurred. Please check your connection and try again.");
      }
    };

    verify();

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 font-sans sm:p-10">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(148,163,184,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.16) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />

      <div className="relative z-10 w-full max-w-md rounded-lg border border-slate-800 bg-slate-950/90 p-8 shadow-2xl shadow-black/50 transition-all duration-300 hover:border-slate-700 sm:p-10">
        <div className="mb-8 flex items-center justify-center gap-3 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-600 text-white shadow-lg shadow-primary-900/30">
            <Icon name="building" className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold">BuildTrack</span>
        </div>

        {status === "loading" && (
          <div className="py-6 text-center">
            <div className="mb-5 flex justify-center">
              <span className="h-9 w-9 animate-spin rounded-full border-2 border-slate-800 border-t-primary-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Verifying Account</h2>
            <p className="mt-2 text-sm text-slate-400">Verifying your account...</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-4 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <Icon name="check" className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Account Verified</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{message}</p>
            <div className="mt-8">
              <Button
                className="w-full rounded-md border-none bg-primary-600 py-3 font-bold text-white shadow-lg shadow-primary-900/20 transition-all duration-150 hover:bg-primary-500 active:scale-[0.99]"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="py-4 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-red-950 bg-red-950/30 text-red-400">
              <Icon name="warning" className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Verification Failed</h2>
            <div className="mt-4 flex items-center justify-center gap-2 rounded-md border border-red-950 bg-red-950/30 px-4 py-3 text-xs font-medium text-red-400">
              <Icon name="warning" className="h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <Button
                className="w-full rounded-md border-none bg-primary-600 py-3 font-bold text-white shadow-lg shadow-primary-900/20 transition-all duration-150 hover:bg-primary-500 active:scale-[0.99]"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
              <Link to="/register" className="text-xs font-semibold text-primary-300 transition-colors hover:text-primary-200">
                Need a new account? Register here
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
