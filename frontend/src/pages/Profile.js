import { useState, useEffect } from "react";
import { Badge, Button, Card, Field, PageHeader } from "../components/UI";
import { useAppData } from "../context/AppData";

const roleTheme = {
  Admin: { 
    bg: "bg-blueprint-navy", 
    text: "text-white", 
    label: "LEVEL 4: SUPERIOR CONTROL", 
    privileges: ["Portfolio Control", "User Permissions", "Financial Settings", "System Logs"],
    colorCode: "NAVY"
  },
  "Project Manager": { 
    bg: "bg-safety-orange", 
    text: "text-white", 
    label: "LEVEL 3: DELIVERY COMMAND", 
    privileges: ["Project Setup", "Crew Allocation", "Material Ledger", "Daily Reporting"],
    colorCode: "ORANGE"
  },
  "Site Engineer": { 
    bg: "bg-safety-yellow", 
    text: "text-blueprint-navy", 
    label: "LEVEL 2: FIELD OPERATIONS", 
    privileges: ["Daily Progress Log", "Tally Submission", "Material Audit", "Worker Roster Read"],
    colorCode: "YELLOW"
  },
  Accountant: { 
    bg: "bg-concrete-gray", 
    text: "text-white", 
    label: "LEVEL 2: BUDGET AUDIT", 
    privileges: ["Expense Ledger", "Invoice Verification", "Budget Review", "Cost Estimation"],
    colorCode: "GRAY"
  },
};

function Barcode() {
  return (
    <div className="flex items-center justify-center gap-[2px] h-8 opacity-75 mt-3 select-none">
      <div className="w-[2px] h-full bg-blueprint-navy" />
      <div className="w-[1px] h-full bg-blueprint-navy" />
      <div className="w-[3px] h-full bg-blueprint-navy" />
      <div className="w-[1.5px] h-full bg-blueprint-navy" />
      <div className="w-[2px] h-full bg-blueprint-navy" />
      <div className="w-[4px] h-full bg-blueprint-navy" />
      <div className="w-[1px] h-full bg-blueprint-navy" />
      <div className="w-[2px] h-full bg-blueprint-navy" />
      <div className="w-[3px] h-full bg-blueprint-navy" />
      <div className="w-[1px] h-full bg-blueprint-navy" />
      <div className="w-[4px] h-full bg-blueprint-navy" />
      <div className="w-[2px] h-full bg-blueprint-navy" />
    </div>
  );
}

function HardHatWatermark() {
  return (
    <svg className="absolute -right-4 -bottom-4 h-28 w-28 text-blueprint-navy/[0.04] pointer-events-none" fill="currentColor" viewBox="0 0 100 100">
      <path d="M50 15 C30 15, 15 25, 15 45 C15 47, 16 48, 18 48 C20 48, 22 47, 24 45 C28 40, 32 38, 50 38 C68 38, 72 40, 76 45 C78 47, 80 48, 82 48 C84 48, 85 47, 85 45 C85 25, 70 15, 50 15 Z" />
      <path d="M10 50 H90 V55 H10 Z" />
      <path d="M47 5 H53 V15 H47 Z" />
    </svg>
  );
}

export default function Profile() {
  const { currentUser, update } = useAppData();
  const [profile, setProfile] = useState({ name: "", email: "", role: "", phone: "+91 98765 43210" });
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      setProfile({
        name: currentUser.name || "",
        email: currentUser.email || "",
        role: currentUser.role || "",
        phone: currentUser.phone || "+91 98765 43210",
      });
    }
  }, [currentUser]);

  const change = (key, value) => {
    setProfile({ ...profile, [key]: value });
    setSaved(false);
  };

  const save = async () => {
    if (!profile.name.trim() || !profile.email.includes("@")) {
      return setError("Enter a valid name and email address.");
    }
    try {
      await update("users", {
        ...currentUser,
        name: profile.name.trim(),
        email: profile.email.trim(),
        phone: profile.phone.trim(),
      });
      setError("");
      setSaved(true);
    } catch (err) {
      setError("Failed to update profile.");
    }
  };

  if (!currentUser) return null;

  const initials = profile.name
    ? profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const theme = roleTheme[profile.role] || roleTheme.Admin;
  const badgeId = `ID-BTRK-${profile.role.slice(0, 3).toUpperCase()}-${currentUser.id ? currentUser.id.split("-").pop() : "001"}`;

  return (
    <>
      <PageHeader title="SITE CREDENTIALS" description="Manage access pass and site operator information." />
      
      <div className="grid gap-8 lg:grid-cols-[380px_1fr] items-start">
        
        {/* Worker ID Badge Card Container */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-[340px] bg-white border border-blueprint-navy/30 relative shadow-lg p-5 pt-7 flex flex-col items-center overflow-hidden">
            {/* Lanyard punch hole simulation */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-3 rounded-full bg-blueprint-navy/15 border border-blueprint-navy/35 flex items-center justify-center">
              <span className="w-6 h-1 bg-blueprint-navy/30 rounded-full" />
            </div>

            {/* Badge header placard */}
            <div className="w-full text-center mt-3 mb-4">
              <p className="text-[10px] font-extrabold font-industry tracking-widest text-[#1B2A41]/60 leading-none">BUILDTRACK SITE ACCESS</p>
              <div className="h-[2px] bg-blueprint-navy/20 w-1/3 mx-auto mt-1" />
            </div>

            {/* Photo frame with colored strip */}
            <div className="relative w-44 h-48 border border-blueprint-navy bg-[#F7F5F0] flex flex-col items-center justify-between p-1 shadow-inner">
              {/* Photo Background texture (blueprint grid) */}
              <div className="absolute inset-0 grid-paper opacity-35" />
              
              {/* Initials avatar centered */}
              <div className="relative z-10 flex-1 flex items-center justify-center text-4xl font-extrabold font-industry text-blueprint-navy/85">
                {initials}
              </div>

              {/* Security Strip */}
              <div className={`w-full ${theme.bg} ${theme.text} text-center py-1.5 z-10 border-t border-blueprint-navy/40`}>
                <p className="text-[10px] font-extrabold font-industry tracking-widest leading-none uppercase">{theme.colorCode} CLEARANCE</p>
              </div>
            </div>

            {/* User Identity Details */}
            <div className="w-full text-center mt-5 z-10">
              <h2 className="text-xl font-extrabold font-industry text-blueprint-navy uppercase tracking-wider leading-none">{profile.name}</h2>
              <p className="text-xs font-bold text-safety-orange font-industry uppercase tracking-widest mt-1.5">{profile.role}</p>
              <p className="text-[10px] font-semibold text-blueprint-navy/50 tracking-wider font-mono mt-1">{badgeId}</p>
            </div>

            {/* Access privileges list */}
            <div className="w-full mt-5 pt-4 border-t border-dashed border-blueprint-navy/30 z-10">
              <p className="text-[9px] font-extrabold tracking-widest text-blueprint-navy/60 font-industry uppercase mb-2">CLEARANCE PROFILE</p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                {theme.privileges.map((priv, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="w-2 h-2 border border-blueprint-navy/30 bg-emerald-500/25 flex items-center justify-center shrink-0">
                      <span className="w-1 h-1 bg-emerald-600" />
                    </span>
                    <span className="text-[9px] font-bold font-industry uppercase tracking-wide text-blueprint-navy/80 truncate">{priv}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Barcode and watermark */}
            <div className="w-full mt-4">
              <Barcode />
            </div>

            <HardHatWatermark />
          </div>
        </div>

        {/* Paperwork Form Edit Details */}
        <Card className="p-6 bg-white">
          <div className="flex items-center justify-between border-b border-blueprint-navy/20 pb-4 mb-6">
            <h3 className="font-extrabold font-industry uppercase tracking-wider text-blueprint-navy text-lg">OPERATOR FILE UPDATE</h3>
            {saved && <Badge tone="green">FILE UPDATED</Badge>}
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            
            {/* SECTION 1: CREDENTIALS */}
            <div>
              <div className="border-b border-blueprint-navy/10 pb-1.5 mb-4">
                <span className="text-xs font-extrabold font-industry uppercase tracking-widest text-blueprint-navy/70">01. CREDENTIALS</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Operator Full Name">
                  <input 
                    className="form-control" 
                    value={profile.name} 
                    onChange={(e) => change("name", e.target.value)} 
                  />
                </Field>
                <Field label="System Role (Read Only)">
                  <input 
                    className="form-control bg-blueprint-navy/[0.03] text-blueprint-navy/60 cursor-not-allowed border-dashed" 
                    value={profile.role} 
                    readOnly 
                  />
                </Field>
              </div>
            </div>

            {/* SECTION 2: CONTACT */}
            <div>
              <div className="border-b border-blueprint-navy/10 pb-1.5 mb-4">
                <span className="text-xs font-extrabold font-industry uppercase tracking-widest text-blueprint-navy/70">02. CONTACT DETAILS</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email Address">
                  <input 
                    className="form-control" 
                    type="email" 
                    value={profile.email} 
                    onChange={(e) => change("email", e.target.value)} 
                  />
                </Field>
                <Field label="Contact Phone">
                  <input 
                    className="form-control" 
                    value={profile.phone} 
                    onChange={(e) => change("phone", e.target.value)} 
                  />
                </Field>
              </div>
            </div>

            {/* SECTION 3: SECURITY */}
            <div>
              <div className="border-b border-blueprint-navy/10 pb-1.5 mb-4">
                <span className="text-xs font-extrabold font-industry uppercase tracking-widest text-blueprint-navy/70">03. SECURITY KEYS</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Current Password">
                  <input 
                    className="form-control" 
                    type="password" 
                    placeholder="••••••••"
                    value={password.current} 
                    onChange={(e) => setPassword({ ...password, current: e.target.value })} 
                  />
                </Field>
                <Field label="New Password">
                  <input 
                    className="form-control" 
                    type="password" 
                    placeholder="••••••••"
                    value={password.next} 
                    onChange={(e) => setPassword({ ...password, next: e.target.value })} 
                  />
                </Field>
                <Field label="Confirm Password">
                  <input 
                    className="form-control" 
                    type="password" 
                    placeholder="••••••••"
                    value={password.confirm} 
                    onChange={(e) => setPassword({ ...password, confirm: e.target.value })} 
                  />
                </Field>
              </div>
            </div>

            {/* Error messaging and Submit */}
            <div className="pt-4 border-t border-blueprint-navy/15">
              {error && <p className="mb-4 text-xs font-bold text-red-600">{error}</p>}
              <Button type="button" onClick={save}>SUBMIT DETAILS TALLY</Button>
            </div>
            
          </form>
        </Card>

      </div>
    </>
  );
}
