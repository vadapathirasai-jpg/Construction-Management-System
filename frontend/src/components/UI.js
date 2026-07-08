export function Button({ children, variant = "primary", className = "", ...props }) {
  const styles = {
    primary: "bg-safety-orange hover:bg-[#d96b14] border border-safety-orange text-white shadow-button hover:-translate-y-0.5 active:scale-[0.97]",
    secondary: "border border-blueprint-navy/35 bg-white text-blueprint-navy hover:bg-blueprint-navy/5 hover:-translate-y-0.5 active:scale-[0.98]",
    danger: "border border-red-600 bg-white text-red-600 hover:bg-red-50 hover:-translate-y-0.5 active:scale-[0.98]",
    ghost: "border-transparent bg-transparent text-blueprint-navy hover:bg-blueprint-navy/5 active:scale-[0.98]",
    dark: "border border-blueprint-navy bg-blueprint-navy text-white hover:bg-blueprint-navy/90 hover:-translate-y-0.5 active:scale-[0.98]",
  };

  return (
    <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-none px-4 py-2 text-xs font-bold font-industry uppercase tracking-wider transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Card({ children, className = "" }) {
  return <section className={`crop-panel transition-all duration-300 ${className}`}>{children}</section>;
}

export function Badge({ children, tone = "blue" }) {
  const tones = {
    blue: "border-blueprint-navy/20 bg-blueprint-navy/5 text-blueprint-navy",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    red: "border-rose-200 bg-rose-50 text-rose-700",
    gray: "border-concrete-gray/30 bg-concrete-gray/5 text-concrete-gray",
  };
  return (
    <span className={`inline-flex items-center gap-1 border px-2.5 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider rounded-none ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const isDelayed = ["Delayed", "Pending", "Low Stock", "On Hold", "On Leave", "Out of Stock"].includes(status);
  const isCompleted = ["Completed", "Approved"].includes(status);
  
  if (isCompleted) {
    return (
      <span className="relative inline-flex items-center px-4 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-700 leading-none" title={status}>
        <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100" fill="currentColor">
          <path d="M 8,1.5 L 92,1.5 L 98.5,8 L 98.5,92 L 92,98.5 L 8,98.5 L 1.5,92 L 1.5,8 Z" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" fillOpacity="0.08" />
        </svg>
        <span className="relative z-10 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-sm" />
          {status}
        </span>
      </span>
    );
  }

  if (isDelayed) {
    return (
      <span className="relative inline-flex items-center px-5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-safety-orange leading-none" title={status}>
        <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100" fill="currentColor">
          <path d="M 50,2 L 98,50 L 50,98 L 2,50 Z" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" fillOpacity="0.08" />
        </svg>
        <span className="relative z-10 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 bg-safety-orange rotate-45" />
          {status}
        </span>
      </span>
    );
  }

  return (
    <span className="relative inline-flex items-center px-3.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-blueprint-navy leading-none" title={status}>
      <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100" fill="currentColor">
        <path d="M 1.5,1.5 H 98.5 V 98.5 H 1.5 Z" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" fillOpacity="0.08" />
        <circle cx="4" cy="4" r="1.2" fill="currentColor" vectorEffect="non-scaling-stroke" />
        <circle cx="96" cy="4" r="1.2" fill="currentColor" vectorEffect="non-scaling-stroke" />
        <circle cx="4" cy="96" r="1.2" fill="currentColor" vectorEffect="non-scaling-stroke" />
        <circle cx="96" cy="96" r="1.2" fill="currentColor" vectorEffect="non-scaling-stroke" />
      </svg>
      <span className="relative z-10 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 bg-blueprint-navy" />
        {status}
      </span>
    </span>
  );
}

export function ProgressBar({ value, compact = false }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  const heightClass = compact ? "h-3" : "h-5";
  return (
    <div className="flex w-full items-center gap-3 font-mono">
      <div className={`relative w-full bg-[#1B2A41]/5 border border-[#1B2A41]/35 rounded-none ${heightClass} overflow-hidden`}>
        <div className="absolute inset-0 flex justify-between px-1 pointer-events-none opacity-20 select-none">
          {[...Array(11)].map((_, i) => (
            <span key={i} className={`w-[1px] bg-[#1B2A41] ${i % 5 === 0 ? "h-full" : "h-1/2"}`} />
          ))}
        </div>
        <div 
          className="h-full bg-safety-orange border-r border-[#1B2A41]/60 transition-all duration-500 ease-out" 
          style={{ width: `${safeValue}%` }} 
        />
      </div>
      <span className="w-10 text-right text-xs font-bold text-blueprint-navy">{safeValue}%</span>
    </div>
  );
}

export function Table({ columns, children, sort, onSort }) {
  return (
    <div className="overflow-x-auto border-t border-blueprint-navy/15">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-blueprint-navy/20 bg-blueprint-navy/[0.03] text-xs font-bold uppercase tracking-wider font-industry text-blueprint-navy">
          <tr>{columns.map((column) => {
            const item = typeof column === "string" ? { label: column } : column;
            const active = Boolean(item.key && sort?.key === item.key);
            const sortIcon = active ? (sort.direction === "asc" ? "sortAsc" : "sortDesc") : "sortNeutral";
            return <th key={item.label} className="whitespace-nowrap px-5 py-3.5">
              {item.key ? <button className="inline-flex items-center gap-1.5 text-left hover:text-safety-orange focus-visible:ring-2 focus-visible:ring-safety-orange" onClick={() => onSort(item.key)} aria-label={`Sort by ${item.label}`}>{item.label}<Icon name={sortIcon} className={`h-3.5 w-3.5 ${active ? "text-safety-orange" : "text-blueprint-navy/40"}`} /></button> : item.label}
            </th>;
          })}</tr>
        </thead>
        <tbody className="divide-y divide-blueprint-navy/10 bg-white">{children}</tbody>
      </table>
    </div>
  );
}

export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-blueprint-navy/15 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold font-industry tracking-wider text-blueprint-navy uppercase sm:text-3xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm font-medium text-[#1B2A41]/75">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function SearchInput({ placeholder = "Search...", value, onChange }) {
  return (
    <label className="relative block w-full sm:max-w-xs">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#1B2A41]/50">
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
  return (
    <div className="grid-paper px-5 py-14 text-center border border-blueprint-navy/15">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center border border-blueprint-navy/25 bg-white text-blueprint-navy shadow-sm">
        <Icon name="search" className="h-5 w-5" />
      </div>
      <p className="text-sm font-bold font-industry uppercase tracking-wider text-blueprint-navy">{message}</p>
      <p className="mt-1 text-xs font-medium text-blueprint-navy/60">Change your search query or reset filters.</p>
    </div>
  );
}

export function LoadingState() {
  return <div className="flex items-center justify-center gap-3 px-5 py-14 text-sm font-bold font-industry uppercase tracking-wider text-blueprint-navy/60"><span className="h-4 w-4 animate-spin border-2 border-blueprint-navy/20 border-t-safety-orange" />Loading database records...</div>;
}

export function Modal({ title, description, children, onClose, footer }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-blueprint-navy/40 p-4 backdrop-blur-sm transition-all duration-300" role="dialog" aria-modal="true">
    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto crop-panel bg-white shadow-modal animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-start justify-between border-b border-blueprint-navy/15 px-6 py-5">
        <div>
          <h2 className="text-lg font-extrabold font-industry tracking-wider uppercase text-blueprint-navy">{title}</h2>
          {description && <p className="mt-1 text-sm text-blueprint-navy/60">{description}</p>}
        </div>
        <button className="p-1 text-blueprint-navy/40 hover:text-blueprint-navy hover:bg-blueprint-navy/5" onClick={onClose} aria-label="Close"><Icon name="close" className="h-5 w-5" /></button>
      </div>
      <div className="p-6">{children}</div>
      {footer && <div className="flex justify-end gap-3 border-t border-blueprint-navy/15 bg-blueprint-navy/[0.02] px-6 py-4">{footer}</div>}
    </div>
  </div>;
}

export function Field({ label, error, children }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold font-industry uppercase tracking-wider text-blueprint-navy/70">{label}</span>{children}{error && <span className="mt-1 block text-xs font-bold text-red-600">{error}</span>}</label>;
}

export function Switch({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-none border-2 border-blueprint-navy transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-safety-orange disabled:cursor-not-allowed disabled:opacity-50 ${checked ? "bg-safety-orange" : "bg-blueprint-navy/10"}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-none bg-blueprint-navy shadow-sm transition duration-200 ease-in-out ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
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
