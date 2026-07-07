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
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-300 shadow-2xl transition-transform lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5 bg-slate-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-primary-600 to-cyan-400 text-white shadow-lg shadow-primary-500/25"><Icon name="building" /></span>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">BuildTrack</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enterprise ERP</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
          <p className="px-3 pb-2 pt-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Workspace</p>
          {navigation.filter(([, , , permission]) => !permission || can(permission)).map(([label, path, icon]) => (
            <NavLink key={path} to={path} onClick={onClose} className={({ isActive }) => `relative flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${isActive ? "bg-slate-900 text-cyan-400 shadow-inner border-l-2 border-cyan-400" : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"}`}>
              <Icon name={icon} className="h-[18px] w-[18px]" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-800 p-3 bg-slate-950">
          <NavLink to="/profile" onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-all duration-150 ${isActive ? "bg-slate-900 text-cyan-400" : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200"}`}>
            <Icon name="profile" className="h-[18px] w-[18px]" />Profile
          </NavLink>
          <button onClick={() => { logout(); navigate("/login"); }} className="mt-1 flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-400 transition-all duration-150 hover:bg-rose-950/20 hover:text-rose-400">
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
    <header className="fixed left-0 right-0 top-0 z-20 h-16 border-b border-slate-200/50 bg-white/70 backdrop-blur-md lg:left-64 shadow-sm">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={onMenu} aria-label="Open sidebar"><Icon name="menu" /></button>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold uppercase text-slate-500">Workspace</p>
            <p className="text-sm font-bold capitalize text-slate-800">{page.replace("-", " ")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications"><Icon name="bell" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary-600 animate-pulse" /></button>
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-primary-600 to-cyan-500 text-sm font-bold text-white shadow-md shadow-primary-500/10">{currentUser.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">{currentUser.name}</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{currentUser.role}</p>
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
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <Navbar onMenu={() => setOpen(true)} />
      <main className="pt-16 lg:pl-64">
        <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8"><Outlet /></div>
      </main>
    </div>
  );
}
