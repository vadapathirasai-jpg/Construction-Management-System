import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, EmptyState, Icon, LoadingState, ProgressBar, StatusBadge, Table } from "../components/UI";
import { useAppData } from "../context/AppData";
import { formatCurrency, formatDate } from "../data";

const rolePresentation = {
  Admin: {
    eyebrow: "Command centre",
    title: "Portfolio control",
    description: "Monitor delivery, people, inventory, and cost across the entire business.",
    accent: "from-cyan-500 to-blue-600",
    eyebrowColor: "text-cyan-300",
    glow: "bg-cyan-400/20",
  },
  "Project Manager": {
    eyebrow: "Delivery workspace",
    title: "Keep every site moving",
    description: "Focus on assigned projects, site teams, upcoming work, and approvals.",
    accent: "from-emerald-500 to-teal-600",
    eyebrowColor: "text-emerald-300",
    glow: "bg-emerald-400/20",
  },
  "Site Engineer": {
    eyebrow: "Site desk",
    title: "Today on site",
    description: "Capture daily progress and see the work that needs your attention.",
    accent: "from-amber-500 to-orange-600",
    eyebrowColor: "text-amber-300",
    glow: "bg-amber-400/20",
  },
  Accountant: {
    eyebrow: "Finance workspace",
    title: "Cost and budget control",
    description: "Review portfolio spend, pending approvals, and available project budget.",
    accent: "from-violet-500 to-indigo-600",
    eyebrowColor: "text-violet-300",
    glow: "bg-violet-400/20",
  },
};

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
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{dateLabel}</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
            Welcome back, {currentUser.name.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Here is what is happening across your workspace today.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
          <Badge tone={hasGlobalScope ? "blue" : "green"}>{projectScope.label}</Badge>
        </div>
      </div>

      {error && <Card className="mb-4 border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">{error}</Card>}
      {loading && <Card className="mb-6"><LoadingState /></Card>}

      <section className="relative mb-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-xl shadow-slate-950/20">
        <div className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${presentation.accent}`} />
        <div className={`absolute -right-16 -top-24 h-72 w-72 rounded-full blur-3xl ${presentation.glow}`} />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:32px_32px]" />
        <div className="relative grid gap-8 px-6 py-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-8 lg:py-8">
          <div>
            <p className={`text-xs font-bold uppercase tracking-[0.2em] ${presentation.eyebrowColor}`}>{presentation.eyebrow}</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{presentation.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{presentation.description}</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {quickActions.map(([label, path, icon, openAdd], index) => (
                <Button
                  key={label}
                  variant={index === 0 ? "primary" : "dark"}
                  onClick={() => navigate(path, { state: { openAdd } })}
                  className={index === 0 ? "border-cyan-500 bg-cyan-500 hover:bg-cyan-400" : ""}
                >
                  <Icon name={icon} className="h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.06] p-4 pr-5 backdrop-blur-sm">
            <ProgressRing value={averageProgress} />
            <div className="min-w-[130px]">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall delivery</p>
              <p className="mt-1 text-sm font-bold text-white">{activeProjects.length} active projects</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">{completedProjects.length} completed across your scope</p>
            </div>
          </div>
        </div>
      </section>

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
    blue: "bg-sky-50 text-sky-700 ring-sky-100 group-hover:bg-sky-100",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100 group-hover:bg-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100 group-hover:bg-amber-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100 group-hover:bg-violet-100",
    red: "bg-rose-50 text-rose-700 ring-rose-100 group-hover:bg-rose-100",
  };
  const cardBorders = {
    blue: "border-t-2 border-t-sky-500",
    green: "border-t-2 border-t-emerald-500",
    amber: "border-t-2 border-t-amber-500",
    violet: "border-t-2 border-t-violet-500",
    red: "border-t-2 border-t-rose-500",
  };
  return (
    <Card className={`group relative overflow-hidden p-5 ${cardBorders[tone] || ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="mt-2 truncate text-2xl font-extrabold tracking-tight text-slate-950 sm:text-[1.7rem]">{value}</p>
        </div>
        <span className={`rounded-xl p-2.5 shadow-sm ring-1 transition-colors ${tones[tone] || tones.blue}`}>
          <Icon name={icon} className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 border-t border-slate-100 pt-3">
        <p className="min-h-4 text-xs font-semibold leading-4 text-slate-500">{detail}</p>
      </div>
    </Card>
  );
}

function ProgressRing({ value }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full bg-white/10" aria-label={`${safeValue}% overall progress`}>
      <div
        className="absolute inset-1 rounded-full"
        style={{ background: `conic-gradient(rgb(34 211 238) ${safeValue * 3.6}deg, rgba(255,255,255,.1) 0deg)` }}
      />
      <div className="absolute inset-2.5 rounded-full bg-slate-950" />
      <span className="relative text-lg font-extrabold text-white">{safeValue}%</span>
    </div>
  );
}

function SectionHeading({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4">
      <div>
        <h2 className="font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-xs font-medium text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

function TextLink({ children, onClick }) {
  return <button onClick={onClick} className="shrink-0 rounded-md px-2 py-1 text-sm font-bold text-primary-800 hover:bg-primary-50">{children}</button>;
}

function AdminWorkspace({ projects, lowStock, pendingExpenses, navigate }) {
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-5">
      <Card className="overflow-hidden xl:col-span-3">
        <SectionHeading title="Portfolio overview" description="Most recent projects across the business" action={<TextLink onClick={() => navigate("/projects")}>View all</TextLink>} />
        {projects.length ? <ProjectTable projects={projects.slice(0, 5)} /> : <EmptyState message="No projects have been created." />}
      </Card>
      <Card className="p-5 xl:col-span-2">
        <h2 className="font-bold text-slate-900">Needs attention</h2>
        <p className="mt-1 text-xs font-medium text-slate-500">Items that may block operations</p>
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
      <Card className="p-5 xl:col-span-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-900">Assigned project delivery</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">Progress across the sites you manage</p>
          </div>
          <TextLink onClick={() => navigate("/progress")}>Full progress</TextLink>
        </div>
        {projects.length ? <div className="mt-6 space-y-6">{projects.slice(0, 5).map((project) => (
          <div key={project.id}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-800">{project.name}</p>
                <p className="mt-0.5 text-xs font-medium text-slate-500">{project.stage || "Planning"} · due {formatDate(project.end)}</p>
              </div>
              <StatusBadge status={project.status} />
            </div>
            <ProgressBar value={getProgress(project)} compact />
          </div>
        ))}</div> : <EmptyState message="No projects are assigned to you." />}
      </Card>
      <Card className="p-5 xl:col-span-2">
        <h2 className="font-bold text-slate-900">Site readiness</h2>
        <p className="mt-1 text-xs font-medium text-slate-500">Crew and supply availability</p>
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
      <Card className="p-5 xl:col-span-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-900">My assigned sites</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">Current stage and completion at a glance</p>
          </div>
          <TextLink onClick={() => navigate("/daily-reports")}>Add report</TextLink>
        </div>
        {projects.length ? <div className="mt-5 grid gap-4 md:grid-cols-2">{projects.map((project) => (
          <button key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-amber-300 hover:bg-amber-50/40">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-slate-900">{project.name}</p>
                <p className="mt-1 text-xs font-medium text-slate-600">{project.location || project.stage || "Site details"}</p>
              </div>
              <span className="text-lg font-extrabold text-amber-700">{getProgress(project)}%</span>
            </div>
            <div className="mt-4"><ProgressBar value={getProgress(project)} compact /></div>
          </button>
        ))}</div> : <EmptyState message="No sites are assigned to your account." />}
      </Card>
      <Card className="p-5 xl:col-span-2">
        <h2 className="font-bold text-slate-900">Daily site brief</h2>
        <p className="mt-1 text-xs font-medium text-slate-500">Your latest operational context</p>
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
      <Card className="overflow-hidden xl:col-span-3">
        <SectionHeading title="Recent transactions" description="Latest expenses across the portfolio" action={<TextLink onClick={() => navigate("/expenses")}>View ledger</TextLink>} />
        {recentExpenses.length ? (
          <Table columns={["Date", "Description", "Project", "Amount", "Approval"]}>
            {recentExpenses.map((expense) => <tr key={expense.id} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-5 py-4 text-slate-700">{formatDate(expense.date)}</td>
              <td className="px-5 py-4 font-semibold text-slate-900">{expense.description}</td>
              <td className="px-5 py-4 text-slate-700">{expense.project}</td>
              <td className="whitespace-nowrap px-5 py-4 font-bold text-slate-900">{formatCurrency(expense.amount)}</td>
              <td className="px-5 py-4"><StatusBadge status={expense.approval} /></td>
            </tr>)}
          </Table>
        ) : <EmptyState message="No expenses have been recorded." />}
      </Card>
      <Card className="p-5 xl:col-span-2">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Budget utilization</h2>
            <p className="mt-1 text-xs font-medium text-slate-500">Recorded spend against budget</p>
          </div>
          <TextLink onClick={() => navigate("/reports")}>Reports</TextLink>
        </div>
        <div className="mt-7">
          <p className="text-3xl font-extrabold tracking-tight text-slate-950">{totalBudget ? Math.round((totalSpend / totalBudget) * 100) : 0}%</p>
          <div className="mt-3"><ProgressBar value={totalBudget ? (totalSpend / totalBudget) * 100 : 0} /></div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs font-semibold text-slate-600">Budget</p><p className="mt-1 font-bold text-slate-900">{formatCurrency(totalBudget)}</p></div>
            <div className="rounded-lg bg-violet-50 p-3"><p className="text-xs font-semibold text-violet-700">Spent</p><p className="mt-1 font-bold text-violet-950">{formatCurrency(totalSpend)}</p></div>
          </div>
          <p className="mt-5 text-xs font-medium text-slate-600">{projects.length} projects included in this portfolio view.</p>
        </div>
      </Card>
    </div>
  );
}

function ProjectTable({ projects }) {
  return (
    <Table columns={["Project", "Manager", "Progress", "Status", "Due Date"]}>
      {projects.map((project) => <tr className="hover:bg-slate-50" key={project.id}>
        <td className="px-5 py-4"><p className="font-bold text-slate-900">{project.name}</p><p className="mt-1 text-xs font-medium text-slate-500">{project.id}</p></td>
        <td className="px-5 py-4 text-slate-700">{project.manager}</td>
        <td className="w-40 px-5 py-4"><ProgressBar value={getProgress(project)} compact /></td>
        <td className="px-5 py-4"><StatusBadge status={project.status} /></td>
        <td className="whitespace-nowrap px-5 py-4 text-slate-700">{formatDate(project.end)}</td>
      </tr>)}
    </Table>
  );
}

function AttentionItem({ tone, icon, title, detail, onClick }) {
  const tones = {
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    sky: "bg-sky-50 text-sky-700 ring-sky-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  };
  const content = (
    <>
      <span className={`rounded-md p-2 ring-1 ${tones[tone]}`}><Icon name={icon} className="h-4 w-4" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-slate-800">{title}</span>
        <span className="mt-0.5 block truncate text-xs font-medium text-slate-600">{detail}</span>
      </span>
      {onClick && <Icon name="arrow" className="h-4 w-4 text-slate-500" />}
    </>
  );
  return onClick
    ? <button onClick={onClick} className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition hover:border-slate-300 hover:bg-slate-50">{content}</button>
    : <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">{content}</div>;
}

function getProgress(project) {
  return project.status === "Completed" ? 100 : Number(project.progress || 0);
}
