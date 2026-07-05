export function Button({ children, variant = "primary", className = "", ...props }) {
  const styles = {
    primary: "border-primary-700 bg-primary-700 text-white hover:bg-primary-800 hover:shadow-button active:scale-[0.98]",
    secondary: "border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98]",
    danger: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 active:scale-[0.98]",
    ghost: "border-transparent bg-transparent text-slate-600 hover:bg-slate-100 active:scale-[0.98]",
  };

  return (
    <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Card({ children, className = "" }) {
  return <section className={`rounded-lg border border-slate-200/80 bg-white shadow-card transition-all duration-300 hover:border-slate-300/80 hover:shadow-cardHover ${className}`}>{children}</section>;
}

export function Badge({ children, tone = "blue" }) {
  const tones = {
    blue: "border-sky-100 bg-sky-50 text-sky-700",
    green: "border-emerald-100 bg-emerald-50 text-emerald-700",
    amber: "border-amber-100 bg-amber-50 text-amber-800",
    red: "border-rose-100 bg-rose-50 text-rose-700",
    gray: "border-slate-200 bg-slate-50 text-slate-600",
  };
  return <span className={`inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function StatusBadge({ status }) {
  const tone = {
    Active: "blue", Completed: "green", "On Hold": "amber",
    "On Site": "green", Available: "blue", "On Leave": "amber",
    "In Stock": "green", "Low Stock": "amber", "Out of Stock": "red",
    Approved: "green", Pending: "amber", Disabled: "red",
  }[status] || "gray";
  return <Badge tone={tone}>{status}</Badge>;
}

export function ProgressBar({ value, compact = false }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="flex w-full items-center gap-3">
      <div className={`w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-inset ring-slate-200/70 ${compact ? "h-2" : "h-3"}`}>
        <div className="h-full rounded-full bg-primary-600 transition-all duration-500 ease-out" style={{ width: `${safeValue}%` }} />
      </div>
      <span className="w-10 text-right text-xs font-bold text-slate-700">{safeValue}%</span>
    </div>
  );
}

export function Table({ columns, children, sort, onSort }) {
  return (
    <div className="overflow-x-auto rounded-b-lg">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-y border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>{columns.map((column) => {
            const item = typeof column === "string" ? { label: column } : column;
            const active = Boolean(item.key && sort?.key === item.key);
            const sortIcon = active ? (sort.direction === "asc" ? "sortAsc" : "sortDesc") : "sortNeutral";
            return <th key={item.label} className="whitespace-nowrap px-5 py-3.5">
              {item.key ? <button className="inline-flex items-center gap-1.5 rounded-md text-left hover:text-slate-800 focus-visible:ring-4 focus-visible:ring-primary-100" onClick={() => onSort(item.key)} aria-label={`Sort by ${item.label}`}>{item.label}<Icon name={sortIcon} className={`h-3.5 w-3.5 ${active ? "text-primary-700" : "text-slate-400"}`} /></button> : item.label}
            </th>;
          })}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
      </table>
    </div>
  );
}

export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-950 sm:text-3xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function SearchInput({ placeholder = "Search...", value, onChange }) {
  return (
    <label className="relative block w-full sm:max-w-xs">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
        <Icon name="search" className="h-4 w-4" />
      </span>
      <input className="form-control pl-9" placeholder={placeholder} value={value} onChange={onChange} />
    </label>
  );
}

export function SelectFilter({ value, onChange, options, label = "All" }) {
  return <select className="form-control sm:w-48" value={value} onChange={onChange}><option value="">{label}</option>{options.map((option) => <option key={option}>{option}</option>)}</select>;
}

export function EmptyState({ message = "No records match the current filters." }) {
  return <div className="px-5 py-14 text-center"><div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-500"><Icon name="search" className="h-5 w-5" /></div><p className="text-sm font-semibold text-slate-700">{message}</p><p className="mt-1 text-xs text-slate-400">Try changing your search or filters.</p></div>;
}

export function LoadingState() {
  return <div className="flex items-center justify-center gap-3 px-5 py-14 text-sm font-medium text-slate-500"><span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary-600" />Loading records...</div>;
}

export function Modal({ title, description, children, onClose, footer }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm transition-all duration-300" role="dialog" aria-modal="true">
    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-modal animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5"><div><h2 className="text-lg font-bold text-slate-900">{title}</h2>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div><button className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-4 focus-visible:ring-primary-100" onClick={onClose} aria-label="Close"><Icon name="close" className="h-5 w-5" /></button></div>
      <div className="p-6">{children}</div>
      {footer && <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">{footer}</div>}
    </div>
  </div>;
}

export function Field({ label, error, children }) {
  return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{children}{error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}</label>;
}

export function Icon({ name, className = "h-5 w-5" }) {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    projects: <><path d="M4 7h16v13H4z" /><path d="M8 7V4h8v3M4 12h16" /></>,
    workers: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    materials: <><path d="m21 16-9 5-9-5 9-5 9 5Z" /><path d="m3 12 9 5 9-5M3 8l9 5 9-5-9-5-9 5Z" /></>,
    expenses: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20M16 15h2" /></>,
    progress: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" /></>,
    profile: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-4" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.7 21h-3.4" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    building: <><path d="M3 21h18M6 21V3h12v18M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    close: <><path d="M18 6 6 18M6 6l12 12" /></>,
    sortAsc: <><path d="m7 14 5-5 5 5" /></>,
    sortDesc: <><path d="m7 10 5 5 5-5" /></>,
    sortNeutral: <><path d="m8 9 4-4 4 4M16 15l-4 4-4-4" /></>,
    warning: <><path d="M12 9v4M12 17h.01" /><path d="M10.3 3.8 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" /></>,
  };
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
