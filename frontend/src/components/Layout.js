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
      {open && <button aria-label="Close sidebar" className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white/95 shadow-xl shadow-slate-950/5 backdrop-blur transition-transform lg:translate-x-0 lg:shadow-none ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-950 text-primary-300"><Icon name="building" /></span>
          <div>
            <p className="text-sm font-bold text-slate-900">BuildTrack</p>
            <p className="text-[11px] font-semibold uppercase text-slate-400">Project Management</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          <p className="px-3 pb-2 pt-3 text-[11px] font-semibold uppercase text-slate-400">Workspace</p>
          {navigation.filter(([, , , permission]) => !permission || can(permission)).map(([label, path, icon]) => (
            <NavLink key={path} to={path} onClick={onClose} className={({ isActive }) => `relative flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 ${isActive ? "bg-primary-50 text-primary-800 shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
              <Icon name={icon} className="h-[18px] w-[18px]" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <NavLink to="/profile" onClick={onClose} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 ${isActive ? "bg-primary-50 text-primary-800" : "text-slate-600 hover:bg-slate-100"}`}>
            <Icon name="profile" className="h-[18px] w-[18px]" />Profile
          </NavLink>
          <button onClick={() => { logout(); navigate("/login"); }} className="mt-1 flex w-full items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-150 hover:bg-rose-50 hover:text-rose-700">
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
    <header className="fixed left-0 right-0 top-0 z-20 h-16 border-b border-slate-200 bg-white/90 backdrop-blur lg:left-64">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={onMenu} aria-label="Open sidebar"><Icon name="menu" /></button>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold uppercase text-slate-400">Workspace</p>
            <p className="text-sm font-bold capitalize text-slate-800">{page.replace("-", " ")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Notifications"><Icon name="bell" /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary-600" /></button>
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary-50 text-sm font-bold text-primary-800 ring-1 ring-primary-100">{currentUser.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-tight">{currentUser.name}</p>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">{currentUser.role}</p>
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
    <div className="min-h-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <Navbar onMenu={() => setOpen(true)} />
      <main className="pt-16 lg:pl-64">
        <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8"><Outlet /></div>
      </main>
    </div>
  );
}
