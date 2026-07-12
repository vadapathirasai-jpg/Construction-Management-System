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
          let errMsg = text || "This verification link is invalid or has expired.";
          if (text && text.trim().startsWith("{")) {
            try {
              const parsed = JSON.parse(text);
              errMsg = parsed.message || parsed.error || errMsg;
            } catch (e) {
              // ignore and keep raw text
            }
          }
          setStatus("error");
          setMessage(errMsg);
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
    <div className="flex min-h-screen items-center justify-center bg-[#F7F5F0] p-6 sm:p-10 font-sans relative">
      <div className="absolute inset-0 grid-paper opacity-[0.4] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md crop-panel bg-white p-8 shadow-lg transition-all duration-300 hover:border-blueprint-navy/35 sm:p-10">
        <div className="mb-6 flex items-center justify-center gap-3 text-blueprint-navy">
          <span className="flex h-10 w-10 items-center justify-center rounded-none bg-safety-orange text-white shadow-md">
            <Icon name="building" className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold font-industry uppercase tracking-widest">BuildTrack</span>
        </div>

        {status === "loading" && (
          <div className="py-6 text-center">
            <div className="mb-5 flex justify-center">
              <span className="h-8 w-8 animate-spin border-2 border-blueprint-navy/20 border-t-safety-orange" />
            </div>
            <h2 className="text-xl font-extrabold font-industry uppercase tracking-wider text-blueprint-navy">Verifying Account</h2>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-blueprint-navy/60">Verifying credential signatures...</p>
          </div>
        )}

        {status === "success" && (
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
        )}

        {status === "error" && (
          <div className="py-4 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-red-200 bg-red-50 text-red-600">
              <Icon name="warning" className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-extrabold font-industry uppercase tracking-wider text-blueprint-navy">Verification Failed</h2>
            <div className="mt-4 flex items-center justify-center gap-2 rounded-none border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700 uppercase">
              <Icon name="warning" className="h-4 w-4 shrink-0" />
              <span>{message}</span>
            </div>
            <div className="mt-8 flex flex-col gap-3">
              <Button
                className="w-full rounded-none py-3"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
              <Link to="/register" className="text-xs font-bold uppercase tracking-wider font-industry text-safety-orange hover:text-[#d96b14] underline">
                Need a new account? Register here
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
