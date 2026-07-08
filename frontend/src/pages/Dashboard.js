import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, EmptyState, Icon, LoadingState, ProgressBar, StatusBadge, Table } from "../components/UI";
import { useAppData } from "../context/AppData";
import { formatCurrency, formatDate } from "../data";

const rolePresentation = {
  Admin: {
    eyebrow: "COMMAND CENTRE",
    title: "PORTFOLIO CONTROL",
    description: "Monitor delivery, crew operations, material inventories, and financial ledger data.",
    accent: "bg-blueprint-navy",
    eyebrowColor: "text-safety-orange",
    glow: "bg-blueprint-navy/10",
  },
  "Project Manager": {
    eyebrow: "DELIVERY WORKSPACE",
    title: "KEEP EVERY SITE MOVING",
    description: "Audit active schedules, dispatch site crews, track inventory logs, and authorize expenses.",
    accent: "bg-safety-orange",
    eyebrowColor: "text-safety-orange",
    glow: "bg-safety-orange/5",
  },
  "Site Engineer": {
    eyebrow: "SITE OPERATIONS CONTROL",
    title: "TODAY ON SITE",
    description: "Compile daily logs, verify current progress checklists, and report immediate site requirements.",
    accent: "bg-safety-yellow",
    eyebrowColor: "text-blueprint-navy",
    glow: "bg-safety-yellow/5",
  },
  Accountant: {
    eyebrow: "FINANCIAL LEDGER CONTROL",
    title: "BUDGET UTILIZATION",
    description: "Audit total portfolio expenditures, authorize pending vouchers, and inspect budget balance.",
    accent: "bg-concrete-gray",
    eyebrowColor: "text-concrete-gray",
    glow: "bg-concrete-gray/5",
  },
};

function SiteOverviewTimeline({ projects, navigate }) {
  const activeProjects = projects.filter((p) => p.status === "Active");
  
  if (!activeProjects.length) {
    return (
      <Card className="p-6 mb-6 bg-white">
        <h2 className="text-sm font-extrabold font-industry tracking-widest text-blueprint-navy uppercase mb-4">SITE SCHEDULING TIMELINE</h2>
        <EmptyState message="No active projects on site schedule." />
      </Card>
    );
  }

  // Parse dates and find bounds
  const projectData = activeProjects.map((p) => {
    const start = new Date(p.start + "T00:00:00");
    const end = new Date(p.end + "T00:00:00");
    return {
      ...p,
      startDate: isNaN(start.getTime()) ? new Date() : start,
      endDate: isNaN(end.getTime()) ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) : end,
    };
  });

  const startTimes = projectData.map((p) => p.startDate.getTime());
  const endTimes = projectData.map((p) => p.endDate.getTime());
  
  // Overall bounds
  const earliestTime = Math.min(...startTimes);
  const latestTime = Math.max(...endTimes);
  
  // Padding dates slightly (10 days on sides)
  const earliestDate = new Date(earliestTime - 10 * 24 * 60 * 60 * 1000);
  const latestDate = new Date(latestTime + 10 * 24 * 60 * 60 * 1000);
  const chartDuration = latestDate.getTime() - earliestDate.getTime();

  // Generate ticks for monthly columns
  const months = [];
  let current = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
  const endMonth = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
  while (current <= endMonth) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }

  const today = new Date();
  const todayLeft = ((today.getTime() - earliestDate.getTime()) / chartDuration) * 100;
  const showToday = today >= earliestDate && today <= latestDate;

  return (
    <Card className="p-5 mb-6 overflow-hidden bg-white">
      <div className="flex items-center justify-between border-b border-blueprint-navy/15 pb-3.5 mb-4">
        <div>
          <h2 className="text-sm font-extrabold font-industry tracking-widest text-blueprint-navy uppercase leading-none">SITE OVERVIEW TIMELINE</h2>
          <p className="text-[10px] font-bold text-[#8E9AA6] uppercase tracking-wider font-industry mt-1">Gantt scheduling & active sequence progress</p>
        </div>
        <button onClick={() => navigate("/progress")} className="text-xs font-bold font-industry uppercase tracking-wider text-safety-orange hover:text-[#d96b14]">
          Full Progress Ledger →
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px] relative pb-2 pt-4">
          
          {/* Timeline Grid Columns Header */}
          <div className="flex border-b border-blueprint-navy/15 pb-2 mb-2 ml-48 text-[9px] font-bold text-blueprint-navy/50 font-mono tracking-widest uppercase relative h-6">
            {months.map((m, idx) => {
              const leftPercent = ((m.getTime() - earliestDate.getTime()) / chartDuration) * 100;
              return (
                <div 
                  key={idx} 
                  className="absolute border-l border-blueprint-navy/10 pl-1.5 h-4"
                  style={{ left: `${Math.max(0, Math.min(100, leftPercent))}%` }}
                >
                  {m.toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}
                </div>
              );
            })}
          </div>

          {/* Today Indicator Line */}
          {showToday && (
            <div 
              className="absolute top-0 bottom-0 w-[2px] bg-safety-orange border-l border-r border-white/60 z-20 pointer-events-none"
              style={{ left: `${todayLeft}%` }}
              title="TODAY"
            >
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-safety-orange text-white text-[7px] font-bold px-1 py-0.5 rounded-none font-mono">TODAY</span>
            </div>
          )}

          {/* Project Gantt Strips */}
          <div className="space-y-4 pt-4">
            {projectData.map((project) => {
              const left = ((project.startDate.getTime() - earliestDate.getTime()) / chartDuration) * 100;
              const width = ((project.endDate.getTime() - project.startDate.getTime()) / chartDuration) * 100;
              const progress = Number(project.progress || 0);

              return (
                <div key={project.id} className="flex items-center">
                  
                  {/* Left Project Info Panel */}
                  <button 
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="w-44 pr-4 text-left group shrink-0"
                  >
                    <p className="text-xs font-bold text-blueprint-navy uppercase tracking-wider group-hover:text-safety-orange truncate leading-tight">
                      {project.name}
                    </p>
                    <p className="text-[9px] font-bold text-[#8E9AA6] uppercase tracking-widest mt-0.5">
                      {(project.manager || "Unassigned").split(" ")[0]} · {project.stage || "FIELD"}
                    </p>
                  </button>

                  {/* Right Timeline Bar Area */}
                  <div className="flex-1 bg-blueprint-navy/[0.02] border-y border-blueprint-navy/[0.05] h-9 relative flex items-center">
                    
                    {/* Month Vertical Grid lines */}
                    {months.map((m, idx) => {
                      const gridLeft = ((m.getTime() - earliestDate.getTime()) / chartDuration) * 100;
                      return (
                        <div 
                          key={idx} 
                          className="absolute top-0 bottom-0 w-[1px] bg-blueprint-navy/5 pointer-events-none"
                          style={{ left: `${gridLeft}%` }}
                        />
                      );
                    })}

                    {/* Gantt Bar Strip */}
                    <div 
                      className="absolute h-6 bg-blueprint-navy text-white text-[9px] font-bold border border-blueprint-navy flex items-center overflow-hidden"
                      style={{ left: `${Math.max(0, Math.min(100, left))}%`, width: `${Math.max(2, Math.min(100 - left, width))}%` }}
                    >
                      {/* Grid background inside bar */}
                      <div className="absolute inset-0 grid-paper opacity-10 pointer-events-none" />
                      
                      {/* Progress Filled Area */}
                      <div 
                        className="h-full bg-safety-orange border-r border-blueprint-navy/40 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />

                      {/* Floating Text Label */}
                      <span className="absolute inset-y-0 left-2 right-2 flex items-center justify-between pointer-events-none z-10 font-mono text-[8px] tracking-wide text-white mix-blend-difference">
                        <span>{project.start.slice(5)}</span>
                        <span>{progress}%</span>
                        <span>{project.end.slice(5)}</span>
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    accessibleProjects: projects,
    projectScope,
    workers,
    materials,
    expenses,
    dailyReports,
    users,
    currentUser,
    loading,
    error,
  } = useAppData();

  const role = currentUser.role;
  const presentation = rolePresentation[role] || rolePresentation.Admin;
  const projectNames = new Set(projects.map((project) => project.name));
  const projectIds = new Set(projects.map((project) => project.id));
  const hasGlobalScope = role === "Admin" || role === "Accountant";
  const visibleWorkers = hasGlobalScope ? workers : workers.filter((worker) => projectNames.has(worker.project));
  const visibleExpenses = hasGlobalScope ? expenses : expenses.filter((expense) => projectNames.has(expense.project));
  const visibleReports = hasGlobalScope ? dailyReports : dailyReports.filter((report) => projectIds.has(report.projectId));
  const activeProjects = projects.filter((project) => project.status === "Active");
  const completedProjects = projects.filter((project) => project.status === "Completed");
  const lowStock = materials.filter((material) => material.status === "Low Stock" || material.status === "Out of Stock");
  const pendingExpenses = visibleExpenses.filter((expense) => expense.approval === "Pending");
  const onSiteWorkers = visibleWorkers.filter((worker) => worker.status === "On Site");
  const totalSpend = visibleExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalBudget = projects.reduce((sum, item) => sum + Number(item.budget || 0), 0);
  const averageProgress = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + getProgress(project), 0) / projects.length)
    : 0;
  const today = new Date().toISOString().slice(0, 10);
  const reportsToday = visibleReports.filter((report) => report.date === today);
  const remainingBudget = totalBudget - totalSpend;
  const dateLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const metricsByRole = {
    Admin: [
      ["Total Projects", projects.length, `${activeProjects.length} currently active`, "projects", "blue"],
      ["Workforce", visibleWorkers.length, `${onSiteWorkers.length} workers on site`, "workers", "green"],
      ["System Users", users.length, `${users.filter((user) => user.status === "Active").length} active accounts`, "profile", "violet"],
      ["Portfolio Spend", formatCurrency(totalSpend), `${pendingExpenses.length} expenses awaiting approval`, "expenses", "amber"],
    ],
    "Project Manager": [
      ["Assigned Projects", projects.length, projectScope.description, "projects", "green"],
      ["Average Progress", `${averageProgress}%`, `${completedProjects.length} projects delivered`, "progress", "blue"],
      ["Site Workforce", onSiteWorkers.length, `${visibleWorkers.length} assigned workers`, "workers", "violet"],
      ["Pending Costs", pendingExpenses.length, formatCurrency(pendingExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0)), "expenses", "amber"],
    ],
    "Site Engineer": [
      ["Assigned Sites", projects.length, projectScope.description, "projects", "amber"],
      ["Overall Progress", `${averageProgress}%`, `${activeProjects.length} active projects`, "progress", "blue"],
      ["Crew On Site", onSiteWorkers.length, `${visibleWorkers.length} people in assigned teams`, "workers", "green"],
      ["Reports Today", reportsToday.length, `${visibleReports.length} reports in your project history`, "check", "violet"],
    ],
    Accountant: [
      ["Portfolio Budget", formatCurrency(totalBudget), `${projects.length} projects in portfolio`, "projects", "violet"],
      ["Recorded Spend", formatCurrency(totalSpend), `${totalBudget ? Math.round((totalSpend / totalBudget) * 100) : 0}% of total budget`, "expenses", "blue"],
      ["Budget Remaining", formatCurrency(remainingBudget), remainingBudget < 0 ? "Portfolio is over budget" : "Available across all projects", "check", remainingBudget < 0 ? "red" : "green"],
      ["Pending Approval", pendingExpenses.length, formatCurrency(pendingExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0)), "warning", "amber"],
    ],
  };

  const quickActions = {
    Admin: [
      ["New Project", "/projects", "projects", true],
      ["Manage Users", "/users", "profile", false],
      ["Add Expense", "/expenses", "expenses", true],
    ],
    "Project Manager": [
      ["Update Projects", "/projects", "projects", false],
      ["Add Worker", "/workers", "workers", true],
      ["Daily Report", "/daily-reports", "progress", false],
    ],
    "Site Engineer": [
      ["Submit Daily Report", "/daily-reports", "progress", false],
      ["View Progress", "/progress", "projects", false],
      ["Open Reports", "/reports", "expenses", false],
    ],
    Accountant: [
      ["Add Expense", "/expenses", "expenses", true],
      ["Review Expenses", "/expenses", "check", false],
      ["Management Reports", "/reports", "progress", false],
    ],
  }[role] || [];

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-blueprint-navy/15 pb-4">
        <div>
          <p className="text-[10px] font-extrabold tracking-widest text-[#8E9AA6] uppercase font-mono">{dateLabel}</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-wider text-blueprint-navy font-industry uppercase sm:text-3xl">
            DAILY BRIEF: {(currentUser?.name || "User").split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-blueprint-navy/70">Operational summary and site checkpoints across your active scope.</p>
        </div>
        <div className="flex items-center gap-2.5 self-start sm:self-auto font-mono text-[10px]">
          <span className="h-2.5 w-2.5 bg-emerald-500 animate-pulse border border-emerald-700" />
          <Badge tone={hasGlobalScope ? "blue" : "green"}>{projectScope.label.toUpperCase()}</Badge>
        </div>
      </div>

      {error && <Card className="mb-4 border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</Card>}
      {loading && <Card className="mb-6"><LoadingState /></Card>}

      {/* Gantt Timeline Site Overview Hero */}
      {!loading && (
        <SiteOverviewTimeline projects={projects} navigate={navigate} />
      )}

      {/* Role desk details */}
      <section className="relative mb-6 overflow-hidden rounded-none border border-blueprint-navy bg-blueprint-navy text-white shadow-xl">
        <div className={`absolute inset-y-0 left-0 w-2 ${presentation.accent}`} />
        <div className={`absolute -right-16 -top-24 h-72 w-72 rounded-full blur-3xl ${presentation.glow}`} />
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative grid gap-8 px-6 py-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-8 lg:py-8">
          <div>
            <p className={`text-xs font-bold uppercase tracking-[0.2em] ${presentation.eyebrowColor} font-industry`}>{presentation.eyebrow}</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-wider text-white font-industry uppercase sm:text-3xl">{presentation.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{presentation.description}</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {quickActions.map(([label, path, icon, openAdd]) => (
                <Button
                  key={label}
                  variant="dark"
                  onClick={() => navigate(path, { state: { openAdd } })}
                  className="border-white/20 bg-white/5 hover:bg-white/10"
                >
                  <Icon name={icon} className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-5 rounded-none border border-white/10 bg-white/[0.04] p-4 pr-5 backdrop-blur-sm">
            <ProgressRing value={averageProgress} />
            <div className="min-w-[130px] font-industry">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8E9AA6]">OVERALL DELIVERY</p>
              <p className="mt-1 text-sm font-extrabold text-white uppercase tracking-wider">{activeProjects.length} active projects</p>
              <p className="mt-0.5 text-xs text-slate-400 uppercase tracking-wider">{completedProjects.length} completed</p>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(metricsByRole[role] || metricsByRole.Admin).map(([label, value, detail, icon, tone]) => (
          <MetricCard key={label} label={label} value={value} detail={detail} icon={icon} tone={tone} />
        ))}
      </div>

      {role === "Admin" && (
        <AdminWorkspace
          projects={projects}
          lowStock={lowStock}
          pendingExpenses={pendingExpenses}
          navigate={navigate}
        />
      )}
      {role === "Project Manager" && (
        <ManagerWorkspace
          projects={projects}
          workers={visibleWorkers}
          lowStock={lowStock}
          navigate={navigate}
        />
      )}
      {role === "Site Engineer" && (
        <EngineerWorkspace
          projects={projects}
          reports={visibleReports}
          workers={visibleWorkers}
          navigate={navigate}
        />
      )}
      {role === "Accountant" && (
        <AccountantWorkspace
          projects={projects}
          expenses={visibleExpenses}
          totalBudget={totalBudget}
          totalSpend={totalSpend}
          navigate={navigate}
        />
      )}
    </>
  );
}

function MetricCard({ label, value, detail, icon, tone }) {
  const tones = {
    blue: "bg-blueprint-navy/5 text-blueprint-navy ring-blueprint-navy/10",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-safety-orange/5 text-safety-orange ring-safety-orange/15",
    violet: "bg-blueprint-navy/5 text-blueprint-navy ring-blueprint-navy/10",
    red: "bg-red-50 text-red-700 ring-red-100",
  };
  const cardBorders = {
    blue: "border-t-2 border-t-blueprint-navy",
    green: "border-t-2 border-t-emerald-600",
    amber: "border-t-2 border-t-safety-orange",
    violet: "border-t-2 border-t-blueprint-navy",
    red: "border-t-2 border-t-red-600",
  };
  return (
    <Card className={`group relative overflow-hidden p-5 ${cardBorders[tone] || "border-t-2 border-t-blueprint-navy"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#8E9AA6] font-industry">{label}</p>
          <p className="mt-1.5 truncate text-2xl font-extrabold tracking-wider text-blueprint-navy font-industry sm:text-[1.7rem]">{value}</p>
        </div>
        <span className={`rounded-none p-2.5 shadow-sm ring-1 transition-colors ${tones[tone] || tones.blue}`}>
          <Icon name={icon} className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 border-t border-blueprint-navy/10 pt-3">
        <p className="min-h-4 text-[10px] font-bold uppercase tracking-wider text-blueprint-navy/60 font-industry">{detail}</p>
      </div>
    </Card>
  );
}

function ProgressRing({ value }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-none bg-blueprint-navy border border-white/20 font-mono" aria-label={`${safeValue}% overall progress`}>
      <div
        className="absolute inset-1 rounded-none"
        style={{ background: `conic-gradient(#F5821F ${safeValue * 3.6}deg, rgba(255,255,255,.1) 0deg)` }}
      />
      <div className="absolute inset-[6px] rounded-none bg-blueprint-navy flex items-center justify-center border border-white/10" />
      <span className="relative text-base font-extrabold text-white z-10">{safeValue}%</span>
    </div>
  );
}

function SectionHeading({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-blueprint-navy/15 bg-blueprint-navy/[0.02]">
      <div>
        <h2 className="font-extrabold font-industry tracking-wider text-blueprint-navy uppercase text-sm">{title}</h2>
        <p className="mt-0.5 text-xs text-blueprint-navy/60 font-medium">{description}</p>
      </div>
      {action}
    </div>
  );
}

function TextLink({ children, onClick }) {
  return <button onClick={onClick} className="shrink-0 rounded-none px-2.5 py-1 text-xs font-bold font-industry uppercase tracking-wider text-safety-orange hover:bg-safety-orange/10 transition">{children}</button>;
}

function AdminWorkspace({ projects, lowStock, pendingExpenses, navigate }) {
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-5">
      <Card className="overflow-hidden xl:col-span-3 bg-white">
        <SectionHeading title="Portfolio overview" description="Most recent projects across the business" action={<TextLink onClick={() => navigate("/projects")}>View all</TextLink>} />
        {projects.length ? <ProjectTable projects={projects.slice(0, 5)} /> : <EmptyState message="No projects have been created." />}
      </Card>
      <Card className="p-5 xl:col-span-2 bg-white">
        <h2 className="font-extrabold font-industry tracking-wider text-blueprint-navy uppercase text-sm mb-1">Needs attention</h2>
        <p className="text-xs text-blueprint-navy/60 font-medium">Items that may block operations</p>
        <div className="mt-5 space-y-3">
          <AttentionItem tone="amber" icon="materials" title={`${lowStock.length} inventory alerts`} detail="Low or unavailable stock items" onClick={() => navigate("/materials")} />
          <AttentionItem tone="rose" icon="expenses" title={`${pendingExpenses.length} pending expenses`} detail="Costs waiting for approval" onClick={() => navigate("/expenses")} />
          <AttentionItem tone="sky" icon="projects" title={`${projects.filter((project) => getProgress(project) < 50).length} projects below 50%`} detail="Review schedule and delivery risks" onClick={() => navigate("/progress")} />
        </div>
      </Card>
    </div>
  );
}

function ManagerWorkspace({ projects, workers, lowStock, navigate }) {
  const available = workers.filter((worker) => worker.status === "Available").length;
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-5">
      <Card className="p-5 xl:col-span-3 bg-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-extrabold font-industry tracking-wider text-blueprint-navy uppercase text-sm mb-1">Assigned project delivery</h2>
            <p className="text-xs text-blueprint-navy/60 font-medium">Progress across the sites you manage</p>
          </div>
          <TextLink onClick={() => navigate("/progress")}>Full progress</TextLink>
        </div>
        {projects.length ? <div className="mt-6 space-y-6">{projects.slice(0, 5).map((project) => (
          <div key={project.id}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-blueprint-navy uppercase tracking-wider font-industry">{project.name}</p>
                <p className="mt-0.5 text-[10px] font-bold text-blueprint-navy/50 font-mono">STAGE: {project.stage || "Planning"} · DUE {formatDate(project.end)}</p>
              </div>
              <StatusBadge status={project.status} />
            </div>
            <ProgressBar value={getProgress(project)} compact />
          </div>
        ))}</div> : <EmptyState message="No projects are assigned to you." />}
      </Card>
      <Card className="p-5 xl:col-span-2 bg-white">
        <h2 className="font-extrabold font-industry tracking-wider text-blueprint-navy uppercase text-sm mb-1">Site readiness</h2>
        <p className="text-xs text-blueprint-navy/60 font-medium">Crew and supply availability</p>
        <div className="mt-5 space-y-3">
          <AttentionItem tone="emerald" icon="workers" title={`${workers.length} assigned workers`} detail={`${available} currently available`} onClick={() => navigate("/workers")} />
          <AttentionItem tone="amber" icon="materials" title={`${lowStock.length} stock warnings`} detail="Review material availability" onClick={() => navigate("/materials")} />
          <AttentionItem tone="sky" icon="progress" title="File today's site update" detail="Record work, labour, and materials" onClick={() => navigate("/daily-reports")} />
        </div>
      </Card>
    </div>
  );
}

function EngineerWorkspace({ projects, reports, workers, navigate }) {
  const latestReport = [...reports].sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-5">
      <Card className="p-5 xl:col-span-3 bg-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-extrabold font-industry tracking-wider text-blueprint-navy uppercase text-sm mb-1">My assigned sites</h2>
            <p className="text-xs text-blueprint-navy/60 font-medium">Current stage and completion at a glance</p>
          </div>
          <TextLink onClick={() => navigate("/daily-reports")}>Add report</TextLink>
        </div>
        {projects.length ? <div className="mt-5 grid gap-4 md:grid-cols-2">{projects.map((project) => (
          <button key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="rounded-none border border-blueprint-navy/15 bg-[#F7F5F0]/50 p-4 text-left transition hover:border-safety-orange hover:bg-safety-orange/[0.02]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-blueprint-navy uppercase tracking-wider font-industry text-xs">{project.name}</p>
                <p className="mt-1 text-[10px] font-bold text-blueprint-navy/60 uppercase font-industry">{project.location || project.stage || "Site details"}</p>
              </div>
              <span className="text-sm font-extrabold font-mono text-blueprint-navy">{getProgress(project)}%</span>
            </div>
            <div className="mt-4"><ProgressBar value={getProgress(project)} compact /></div>
          </button>
        ))}</div> : <EmptyState message="No sites are assigned to your account." />}
      </Card>
      <Card className="p-5 xl:col-span-2 bg-white">
        <h2 className="font-extrabold font-industry tracking-wider text-blueprint-navy uppercase text-sm mb-1">Daily site brief</h2>
        <p className="text-xs text-blueprint-navy/60 font-medium">Your latest operational context</p>
        <div className="mt-5 space-y-3">
          <AttentionItem tone="emerald" icon="workers" title={`${workers.filter((worker) => worker.status === "On Site").length} crew members on site`} detail={`${workers.length} total in assigned teams`} />
          <AttentionItem tone="sky" icon="check" title={latestReport ? `Last report: ${formatDate(latestReport.date)}` : "No report submitted yet"} detail={latestReport?.remarks || "Submit a report to start the site timeline"} onClick={() => navigate("/daily-reports")} />
        </div>
      </Card>
    </div>
  );
}

function AccountantWorkspace({ projects, expenses, totalBudget, totalSpend, navigate }) {
  const recentExpenses = [...expenses].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 6);
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-5">
      <Card className="overflow-hidden xl:col-span-3 bg-white">
        <SectionHeading title="Recent transactions" description="Latest expenses across the portfolio" action={<TextLink onClick={() => navigate("/expenses")}>View ledger</TextLink>} />
        {recentExpenses.length ? (
          <Table columns={["Date", "Description", "Project", "Amount", "Approval"]}>
            {recentExpenses.map((expense) => (
              <tr key={expense.id} className="hover:bg-blueprint-navy/[0.01]">
                <td className="whitespace-nowrap px-5 py-4 text-xs font-mono text-blueprint-navy/80">{formatDate(expense.date)}</td>
                <td className="px-5 py-4 text-xs font-bold text-blueprint-navy uppercase tracking-wider font-industry">{expense.description}</td>
                <td className="px-5 py-4 text-xs text-blueprint-navy/80 uppercase font-industry">{expense.project}</td>
                <td className="whitespace-nowrap px-5 py-4 text-xs font-bold font-mono text-blueprint-navy">{formatCurrency(expense.amount)}</td>
                <td className="px-5 py-4"><StatusBadge status={expense.approval} /></td>
              </tr>
            ))}
          </Table>
        ) : <EmptyState message="No expenses have been recorded." />}
      </Card>
      <Card className="p-5 xl:col-span-2 bg-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-extrabold font-industry tracking-wider text-blueprint-navy uppercase text-sm mb-1">Budget utilization</h2>
            <p className="text-xs text-blueprint-navy/60 font-medium">Recorded spend against budget</p>
          </div>
          <TextLink onClick={() => navigate("/reports")}>Reports</TextLink>
        </div>
        <div className="mt-7">
          <p className="text-3xl font-extrabold tracking-wider text-blueprint-navy font-industry">{totalBudget ? Math.round((totalSpend / totalBudget) * 100) : 0}%</p>
          <div className="mt-3"><ProgressBar value={totalBudget ? (totalSpend / totalBudget) * 100 : 0} /></div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-none border border-blueprint-navy/15 bg-[#F7F5F0]/60 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-blueprint-navy/50 font-industry">BUDGET TALLY</p><p className="mt-1 font-extrabold text-sm text-blueprint-navy font-mono">{formatCurrency(totalBudget)}</p></div>
            <div className="rounded-none border border-safety-orange/20 bg-safety-orange/[0.02] p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-safety-orange/80 font-industry">SPENT TALLY</p><p className="mt-1 font-extrabold text-sm text-safety-orange font-mono">{formatCurrency(totalSpend)}</p></div>
          </div>
          <p className="mt-5 text-[10px] font-semibold text-[#8E9AA6] uppercase tracking-wider font-industry">{projects.length} projects included in this ledger summary.</p>
        </div>
      </Card>
    </div>
  );
}

function ProjectTable({ projects }) {
  return (
    <Table columns={["Project", "Manager", "Progress", "Status", "Due Date"]}>
      {projects.map((project) => (
        <tr className="hover:bg-blueprint-navy/[0.01]" key={project.id}>
          <td className="px-5 py-4">
            <p className="font-bold text-blueprint-navy uppercase tracking-wider font-industry text-xs">{project.name}</p>
            <p className="mt-0.5 text-[10px] font-bold text-[#8E9AA6] font-mono uppercase">{project.id}</p>
          </td>
          <td className="px-5 py-4 text-xs font-bold text-blueprint-navy/80 uppercase font-industry">{project.manager}</td>
          <td className="w-40 px-5 py-4"><ProgressBar value={getProgress(project)} compact /></td>
          <td className="px-5 py-4"><StatusBadge status={project.status} /></td>
          <td className="whitespace-nowrap px-5 py-4 text-xs font-mono text-blueprint-navy/80">{formatDate(project.end)}</td>
        </tr>
      ))}
    </Table>
  );
}

function AttentionItem({ tone, icon, title, detail, onClick }) {
  const tones = {
    amber: "bg-safety-orange/5 text-safety-orange ring-safety-orange/15",
    rose: "bg-red-50 text-red-700 ring-red-100",
    sky: "bg-blueprint-navy/5 text-blueprint-navy ring-blueprint-navy/10",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  };
  const content = (
    <>
      <span className={`rounded-none p-2 ring-1 ${tones[tone]}`}><Icon name={icon} className="h-4 w-4" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold font-industry uppercase tracking-wider text-blueprint-navy">{title}</span>
        <span className="mt-0.5 block truncate text-[10px] text-blueprint-navy/60 font-medium">{detail}</span>
      </span>
      {onClick && <Icon name="arrow" className="h-4 w-4 text-blueprint-navy/40" />}
    </>
  );
  return onClick
    ? <button onClick={onClick} className="flex w-full items-center gap-3 rounded-none border border-blueprint-navy/15 p-3 text-left transition hover:border-blueprint-navy/30 hover:bg-blueprint-navy/[0.02]">{content}</button>
    : <div className="flex items-center gap-3 rounded-none border border-blueprint-navy/15 p-3">{content}</div>;
}

function getProgress(project) {
  return project.status === "Completed" ? 100 : Number(project.progress || 0);
}
