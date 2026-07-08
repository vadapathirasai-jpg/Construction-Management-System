import { useState } from "react";
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "./UI";
import { useAppData } from "../context/AppData";

const navigation = [
  ["Dashboard", "/dashboard", "dashboard", null],
  ["Projects", "/projects", "projects", null],
  ["Workers", "/workers", "workers", "manageWorkers"],
  ["Materials", "/materials", "materials", "manageMaterials"],
  ["Expenses", "/expenses", "expenses", "manageExpenses"],
  ["Progress", "/progress", "progress", null],
  ["Daily Reports", "/daily-reports", "progress", "dailyReport"],
  ["Reports", "/reports", "expenses", "viewReports"],
  ["Users", "/users", "profile", "manageUsers"],
];

function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const { can, logout } = useAppData();
  return (
    <>
      {open && <button aria-label="Close sidebar" className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/10 bg-blueprint-navy text-slate-300 shadow-2xl transition-transform lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5 bg-blueprint-navy">
          <span className="flex h-9 w-9 items-center justify-center rounded-none bg-safety-orange text-white shadow-md"><Icon name="building" /></span>
          <div>
            <p className="text-sm font-bold text-white tracking-wider font-industry uppercase">BuildTrack</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8E9AA6]">Enterprise ERP</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          <p className="px-3 pb-1.5 pt-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 font-industry">Workspace</p>
          {navigation.filter(([, , , permission]) => !permission || can(permission)).map(([label, path, icon]) => (
            <NavLink key={path} to={path} onClick={onClose} className={({ isActive }) => `relative flex items-center gap-3 rounded-none px-3.5 py-2 text-xs font-bold font-industry uppercase tracking-wider transition-all duration-150 ${isActive ? "bg-white/5 text-safety-orange border-l-2 border-safety-orange shadow-inner" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
              <Icon name={icon} className="h-[18px] w-[18px] shrink-0" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3 bg-blueprint-navy">
          <NavLink to="/profile" onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-none px-3.5 py-2 text-xs font-bold font-industry uppercase tracking-wider transition-all duration-150 ${isActive ? "bg-white/5 text-safety-orange" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
            <Icon name="profile" className="h-[18px] w-[18px]" />Profile
          </NavLink>
          <button onClick={() => { logout(); navigate("/login"); }} className="mt-1 flex w-full items-center gap-3 rounded-none px-3.5 py-2 text-xs font-bold font-industry uppercase tracking-wider text-slate-400 transition-all duration-150 hover:bg-rose-950/20 hover:text-rose-400">
            <Icon name="logout" className="h-[18px] w-[18px]" />Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function Navbar({ onMenu }) {
  const location = useLocation();
  const { currentUser } = useAppData();
  const page = location.pathname.split("/")[1] || "dashboard";
  return (
    <header className="fixed left-0 right-0 top-0 z-20 h-16 border-b border-blueprint-navy/15 bg-white/80 backdrop-blur-md lg:left-64">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button className="p-2 text-blueprint-navy hover:bg-blueprint-navy/5 lg:hidden" onClick={onMenu} aria-label="Open sidebar"><Icon name="menu" /></button>
          <div className="hidden sm:block">
            <p className="text-[10px] font-bold uppercase tracking-wider text-blueprint-navy/60 font-industry">Workspace</p>
            <p className="text-sm font-bold uppercase tracking-wider text-blueprint-navy font-industry">{page.replace("-", " ")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-blueprint-navy/70 hover:bg-blueprint-navy/5 hover:text-blueprint-navy" aria-label="Notifications">
            <Icon name="bell" />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 bg-safety-orange animate-pulse" />
          </button>
          <div className="h-8 w-px bg-blueprint-navy/15" />
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-none border border-blueprint-navy/20 bg-blueprint-navy/5 text-sm font-bold text-blueprint-navy font-industry tracking-wider">
              {(currentUser?.name || "User").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-blueprint-navy uppercase tracking-wider font-industry leading-none">{currentUser.name}</p>
              <p className="text-[10px] font-bold text-[#8E9AA6] uppercase tracking-wider font-industry mt-1">{currentUser.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { token, currentUser } = useAppData();

  if (!token || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <Navbar onMenu={() => setOpen(true)} />
      <main className="pt-16 lg:pl-64">
        <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8"><Outlet /></div>
      </main>
    </div>
  );
}
