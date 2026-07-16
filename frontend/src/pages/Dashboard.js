import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Card, EmptyState, Icon, LoadingState, ProgressBar, StatusBadge, Table, Modal, Field } from "../components/UI";
import { useAppData } from "../context/AppData";
import { formatCurrency, formatDate } from "../data";
import ProjectAssignmentPanel from "../components/ProjectAssignmentPanel";
import GanttChart from "../components/GanttChart";

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



export default function Dashboard() {
  const navigate = useNavigate();
  const [activeAssignmentProject, setActiveAssignmentProject] = useState(null);
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
    financialSummaries,
    payments,
  } = useAppData();

  const role = currentUser.role;
  const presentation = rolePresentation[role] || rolePresentation.Admin;
  const projectNames = new Set(projects.map((project) => project.name));
  const projectIds = new Set(projects.map((project) => project.id));
  const hasGlobalScope = role === "Admin" || role === "Accountant";
  const visibleWorkers = hasGlobalScope ? workers : workers.filter((worker) => projectNames.has(worker.project?.name || worker.project));
  const visibleExpenses = hasGlobalScope ? expenses : expenses.filter((expense) => projectNames.has(expense.project?.name || expense.project));
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
  
  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const thisMonthExpenses = expenses
    .filter((e) => e.date && e.date.startsWith(currentYearMonth))
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  const remainingBudget = totalBudget - totalSpend;
  const dateLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const metricsByRole = {
    Admin: [
      ["Active Projects", activeProjects.length, `${projects.length} total projects`, "projects", "blue"],
      ["Pending Approvals", users.filter((u) => u.status === "Pending").length, "Requires manual approval", "profile", users.filter((u) => u.status === "Pending").length > 0 ? "amber" : "green"],
      ["Total Workforce", workers.length, `${workers.filter(w => w.status === "On Site").length} workers on site`, "workers", "violet"],
      ["Month Expenditures", formatCurrency(thisMonthExpenses), "Current month spend", "expenses", "green"],
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

  if (role !== "Admin" && projects.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6 font-sans">
        <Card className="max-w-md p-8 text-center bg-white border-t-2 border-t-safety-orange">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-safety-orange/10 text-safety-orange">
            <Icon name="warning" className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-extrabold font-industry uppercase tracking-wider text-blueprint-navy">No Project Assignment</h2>
          <p className="mt-3 text-xs font-semibold text-blueprint-navy/60 leading-relaxed uppercase">
            You haven't been assigned to any projects yet. Please contact your Admin to get started.
          </p>
        </Card>
      </div>
    );
  }

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
        <GanttChart />
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
          workers={workers}
          expenses={expenses}
          onManageTeam={setActiveAssignmentProject}
        />
      )}
      {role === "Project Manager" && (
        <ManagerWorkspace
          projects={projects}
          workers={workers}
          expenses={expenses}
          navigate={navigate}
          onManageTeam={setActiveAssignmentProject}
        />
      )}
      {role === "Site Engineer" && (
        <EngineerWorkspace
          projects={projects}
          reports={dailyReports}
          workers={workers}
          navigate={navigate}
        />
      )}
      {role === "Accountant" && (
        <AccountantWorkspace
          projects={projects}
          expenses={expenses}
          payments={payments}
          financialSummaries={financialSummaries}
          navigate={navigate}
        />
      )}

      {/* Project Assignment Dialog */}
      {activeAssignmentProject && (
        <ProjectAssignmentPanel
          project={activeAssignmentProject}
          onClose={() => setActiveAssignmentProject(null)}
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

function EditUserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({ ...user });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.includes("@") || !form.role) {
      setError("Please fill all required fields correctly.");
      return;
    }
    onSave(form);
  };

  return (
    <Modal
      title="Edit User Details"
      description={`Update profile information for ${user.id}.`}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        {error && <p className="text-xs font-bold text-red-600">{error.toUpperCase()}</p>}
        <Field label="Full Name">
          <input
            className="form-control"
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </Field>
        <Field label="Email Address">
          <input
            className="form-control"
            type="email"
            value={form.email || ""}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </Field>
        <Field label="Role">
          <select
            className="form-control"
            value={form.role || ""}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            required
          >
            <option value="Admin">Admin</option>
            <option value="Project Manager">Project Manager</option>
            <option value="Site Engineer">Site Engineer</option>
            <option value="Accountant">Accountant</option>
          </select>
        </Field>
      </form>
    </Modal>
  );
}

function AdminWorkspace({ projects, lowStock, pendingExpenses, navigate, workers, expenses, onManageTeam }) {
  const { users, update, remove, currentUser } = useAppData();
  const [activeEditUser, setActiveEditUser] = useState(null);
  const [actionError, setActionError] = useState("");

  const pendingUsers = users.filter((u) => u.status === "Pending");

  const handleApproveUser = async (user) => {
    setActionError("");
    const result = await update("users", { ...user, status: "Active" });
    if (result && !result.success) {
      setActionError(result.error || "Failed to approve user.");
    }
  };

  const handleToggleUserStatus = async (user) => {
    setActionError("");
    const nextStatus = user.status === "Active" ? "Disabled" : "Active";
    const result = await update("users", { ...user, status: nextStatus });
    if (result && !result.success) {
      setActionError(result.error || `Failed to change user status to ${nextStatus}.`);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setActionError("");
      try {
        await remove("users", userId);
      } catch (err) {
        setActionError("Failed to delete user.");
      }
    }
  };

  const handleSaveUserEdit = async (editedUser) => {
    setActionError("");
    const result = await update("users", editedUser);
    if (result && result.success) {
      setActiveEditUser(null);
    } else {
      setActionError(result.error || "Failed to save user edits.");
    }
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (window.confirm(`Are you sure you want to delete project "${projectName}"?`)) {
      setActionError("");
      try {
        await remove("projects", projectId);
      } catch (err) {
        setActionError("Failed to delete project.");
      }
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {actionError && (
        <Card className="border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 flex justify-between items-center">
          <span>{actionError.toUpperCase()}</span>
          <button onClick={() => setActionError("")} className="text-red-700 font-bold hover:opacity-80">Dismiss</button>
        </Card>
      )}

      {/* A. Pending Approvals Widget */}
      {pendingUsers.length > 0 && (
        <Card className="border-l-4 border-l-safety-orange bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-blueprint-navy/15 px-5 py-3.5 bg-safety-orange/5">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center bg-safety-orange text-white text-[10px] font-bold font-mono">
                {pendingUsers.length}
              </span>
              <h2 className="text-xs font-extrabold font-industry tracking-wider text-blueprint-navy uppercase">
                Pending Account Registrations
              </h2>
            </div>
            <p className="text-[10px] font-bold text-safety-orange uppercase tracking-wider font-industry">Manual Approval Required</p>
          </div>
          <div className="divide-y divide-blueprint-navy/10">
            {pendingUsers.map((user) => (
              <div key={user.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-3 hover:bg-blueprint-navy/[0.01]">
                <div>
                  <p className="text-xs font-bold text-blueprint-navy uppercase tracking-wider font-industry">{user.name}</p>
                  <p className="text-[9px] font-bold text-[#8E9AA6] font-mono uppercase">{user.role} · {user.email}</p>
                </div>
                <Button
                  variant="secondary"
                  className="self-start sm:self-auto h-8 min-h-0 px-4 text-[10px] bg-safety-orange/10 border-safety-orange/20 text-safety-orange hover:bg-safety-orange hover:text-white"
                  onClick={() => handleApproveUser(user)}
                >
                  Approve Account
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Grid containing Projects and Attention cards */}
      <div className="grid gap-6 xl:grid-cols-5">
        {/* C. Projects Table */}
        <Card className="overflow-hidden xl:col-span-3 bg-white">
          <SectionHeading title="Portfolio overview" description="Manage projects, budgets, and teams" action={<TextLink onClick={() => navigate("/projects")}>View all</TextLink>} />
          {projects.length ? (
            <Table columns={["Project", "Manager", "Progress", "Budget", "Status", "Actions"]}>
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-blueprint-navy/[0.01]">
                  <td className="px-5 py-4">
                    <p className="font-bold text-blueprint-navy uppercase tracking-wider font-industry text-xs">{project.name}</p>
                    <p className="mt-0.5 text-[10px] font-bold text-[#8E9AA6] font-mono uppercase">{project.id}</p>
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-blueprint-navy/80 uppercase font-industry">
                    {project.manager?.name || project.manager || "Unassigned"}
                  </td>
                  <td className="w-32 px-5 py-4">
                    <ProgressBar value={getProgress(project)} compact />
                  </td>
                  <td className="px-5 py-4 text-xs font-bold font-mono text-blueprint-navy">
                    {formatCurrency(project.budget)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        className="h-8 min-h-0 px-3 text-[10px] rounded-none border-blueprint-navy/20"
                        onClick={() => onManageTeam(project)}
                      >
                        Team
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-8 min-h-0 px-3 text-[10px] rounded-none"
                        onClick={() => navigate("/projects", { state: { openEditId: project.id } })}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        className="h-8 min-h-0 px-3 text-[10px] rounded-none disabled:opacity-50"
                        disabled={project.status !== "Completed"}
                        title={project.status !== "Completed" ? "Only completed projects can be deleted" : "Delete Project"}
                        onClick={() => handleDeleteProject(project.id, project.name)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <EmptyState message="No projects have been created." />
          )}
        </Card>

        {/* Needs Attention Column */}
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

      {/* D. Users Table */}
      <Card className="overflow-hidden bg-white">
        <SectionHeading title="User Accounts" description="Manage system users, approve credentials, and toggle status." />
        {users.length ? (
          <Table columns={["User", "Email", "Role", "Status", "Actions"]}>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-blueprint-navy/[0.01]">
                <td className="px-5 py-4">
                  <p className="font-bold text-blueprint-navy uppercase tracking-wider font-industry text-xs">{user.name}</p>
                  <p className="mt-0.5 text-[10px] font-bold text-[#8E9AA6] font-mono uppercase">{user.id}</p>
                </td>
                <td className="px-5 py-4 text-xs font-mono text-slate-600">
                  {user.email}
                </td>
                <td className="px-5 py-4">
                  <Badge tone="blue">{user.role}</Badge>
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={user.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    {user.status === "Pending" && (
                      <Button
                        variant="secondary"
                        className="h-8 min-h-0 px-3 text-[10px] rounded-none bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                        onClick={() => handleApproveUser(user)}
                      >
                        Approve
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="h-8 min-h-0 px-3 text-[10px] rounded-none"
                      onClick={() => setActiveEditUser(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant={user.status === "Active" ? "danger" : "secondary"}
                      className="h-8 min-h-0 px-3 text-[10px] rounded-none"
                      disabled={user.id === currentUser?.id}
                      onClick={() => handleToggleUserStatus(user)}
                    >
                      {user.status === "Active" ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="danger"
                      className="h-8 min-h-0 px-3 text-[10px] rounded-none"
                      disabled={user.id === currentUser?.id}
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyState message="No system users found." />
        )}
      </Card>



      {/* User Editing Dialog */}
      {activeEditUser && (
        <EditUserModal
          user={activeEditUser}
          onClose={() => setActiveEditUser(null)}
          onSave={handleSaveUserEdit}
        />
      )}
    </div>
  );
}

function ManagerWorkspace({ projects, workers, expenses, navigate, onManageTeam }) {
  const getBudgetUsedPercent = (project) => {
    const projectExpenses = expenses.filter(
      (e) =>
        (e.project?.id || e.project) === project.id ||
        (e.project?.name || e.project) === project.name
    );
    const spent = projectExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    return project.budget ? Math.round((spent / project.budget) * 100) : 0;
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => {
          const budgetUsed = getBudgetUsedPercent(project);
          const progress = project.status === "Completed" ? 100 : Number(project.progress || 0);

          return (
            <Card
              key={project.id}
              className="group relative cursor-pointer overflow-hidden p-6 border-t-2 border-t-blueprint-navy bg-white hover:border-safety-orange hover:shadow-md transition-all duration-300"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#8E9AA6] font-industry">
                    {project.client}
                  </p>
                  <h3 className="mt-1 truncate text-lg font-extrabold tracking-wider text-blueprint-navy font-industry uppercase">
                    {project.name}
                  </h3>
                  <p className="mt-0.5 text-[10px] font-bold text-blueprint-navy/50 font-mono">
                    ID: {project.id} · STAGE: {project.stage || "Planning"}
                  </p>
                </div>
                <StatusBadge status={project.status} />
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="mb-1 flex items-center justify-between text-[10px] font-bold font-industry uppercase text-blueprint-navy/70">
                    <span>Overall Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <ProgressBar value={progress} compact />
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-blueprint-navy/10 pt-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-blueprint-navy/40 font-industry">
                      Budget Used
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-blueprint-navy font-mono">
                      {budgetUsed}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-blueprint-navy/40 font-industry">
                      Total Budget
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-blueprint-navy font-mono">
                      {formatCurrency(project.budget)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="secondary"
                    className="h-8 min-h-0 px-3 text-[10px] rounded-none border-blueprint-navy/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onManageTeam(project);
                    }}
                  >
                    Manage Team
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function EngineerWorkspace({ projects, reports, workers, navigate }) {
  const latestReports = [...reports].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="mt-6 space-y-6">
      {/* Quick Action Project Cards */}
      <div>
        <h2 className="text-xs font-extrabold font-industry tracking-wider text-blueprint-navy uppercase mb-3">
          Assigned Projects
        </h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="p-6 border-t-2 border-t-blueprint-navy bg-white hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#8E9AA6] font-industry">
                      {project.location || "Site Location"}
                    </p>
                    <h3 className="mt-1 truncate text-base font-extrabold tracking-wider text-blueprint-navy font-industry uppercase">
                      {project.name}
                    </h3>
                    <p className="mt-0.5 text-[10px] font-bold text-blueprint-navy/50 font-mono">
                      STAGE: {project.stage || "Planning"}
                    </p>
                  </div>
                  <span className="text-xs font-extrabold font-mono text-blueprint-navy">
                    {project.status === "Completed" ? 100 : Number(project.progress || 0)}%
                  </span>
                </div>
                <div className="mt-4">
                  <ProgressBar value={project.status === "Completed" ? 100 : Number(project.progress || 0)} compact />
                </div>
              </div>

              <div className="mt-6 border-t border-blueprint-navy/10 pt-4">
                <Button
                  className="w-full text-[10px] font-bold uppercase tracking-wider font-industry py-2.5 rounded-none"
                  onClick={() => navigate("/daily-reports", { state: { projectId: project.id } })}
                >
                  Submit Daily Report
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Submission History Table */}
      <Card className="overflow-hidden bg-white">
        <SectionHeading
          title="Recent Site Reports"
          description="Your latest daily submissions"
          action={<TextLink onClick={() => navigate("/daily-reports")}>New report</TextLink>}
        />
        {latestReports.length ? (
          <Table columns={["Date", "Project", "Workers Present", "Progress", "Site Update"]}>
            {latestReports.map((report) => {
              const proj = projects.find((p) => p.id === report.projectId);
              return (
                <tr key={report.id} className="hover:bg-blueprint-navy/[0.01]">
                  <td className="whitespace-nowrap px-5 py-4 text-xs font-mono text-blueprint-navy/80">
                    {formatDate(report.date)}
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-blueprint-navy uppercase tracking-wider font-industry">
                    {proj?.name || "Unknown Project"}
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-blueprint-navy/80 font-mono">
                    {report.present} present (absent: {report.absent || 0})
                  </td>
                  <td className="px-5 py-4">
                    <Badge tone="blue">{report.progress}%</Badge>
                  </td>
                  <td className="max-w-md px-5 py-4 text-xs text-slate-600 truncate">
                    {report.remarks}
                  </td>
                </tr>
              );
            })}
          </Table>
        ) : (
          <EmptyState message="No daily reports submitted yet." />
        )}
      </Card>
    </div>
  );
}

function AccountantWorkspace({ projects, expenses, payments, financialSummaries, navigate }) {

  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);

  const overduePayments = payments.filter(p => p.status === "APPROVED" && p.dueDate && new Date(p.dueDate) < now);
  const upcomingPayments = payments.filter(p => p.status === "APPROVED" && p.dueDate && new Date(p.dueDate) >= now && new Date(p.dueDate) <= nextWeek);
  const upcomingAmount = upcomingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="mt-6 space-y-6">
      {/* Needs Attention Column */}
      {(overduePayments.length > 0 || upcomingPayments.length > 0) && (
        <Card className="p-5 bg-white border-l-4 border-l-safety-orange">
          <h2 className="font-extrabold font-industry tracking-wider text-blueprint-navy uppercase text-sm mb-1">Financial Alerts</h2>
          <div className="mt-4 space-y-3">
            {overduePayments.length > 0 && (
              <AttentionItem tone="rose" icon="warning" title={`${overduePayments.length} payments overdue`} detail="Process these immediately to avoid delays." onClick={() => navigate("/payments")} />
            )}
            {upcomingPayments.length > 0 && (
              <AttentionItem tone="amber" icon="check" title={`${formatCurrency(upcomingAmount)} due within the next 7 days`} detail="Prepare for upcoming cash outflows." onClick={() => navigate("/payments")} />
            )}
          </div>
        </Card>
      )}

      {/* Project Financial Summaries Table */}
      <Card className="overflow-hidden bg-white">
        <SectionHeading
          title="Project Financial Summary"
          description="High-level view of project budgets, expenses, and payment statuses."
        />
        {financialSummaries.length ? (
          <div className="overflow-x-auto">
            <Table columns={["Project", "Budget", "Total Expenses", "Total Paid", "Approved (Unpaid)", "Pending Approval", "Remaining Budget", "Overdue"]}>
              {financialSummaries.map((summary) => (
                <tr key={summary.projectId} className="hover:bg-blueprint-navy/[0.01]">
                  <td className="px-5 py-4">
                    <p className="font-bold text-blueprint-navy uppercase tracking-wider font-industry text-xs">{summary.projectName}</p>
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-blueprint-navy font-mono">
                    {formatCurrency(summary.budget)}
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-slate-600 font-mono">
                    {formatCurrency(summary.totalExpenses)}
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-emerald-600 font-mono">
                    {formatCurrency(summary.totalPaid)}
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-amber-600 font-mono">
                    {formatCurrency(summary.approvedUnpaid)}
                  </td>
                  <td className="px-5 py-4 text-xs font-bold text-slate-400 font-mono">
                    {formatCurrency(summary.pendingApproval)}
                  </td>
                  <td className="px-5 py-4 text-xs font-bold font-mono">
                    <span className={summary.remainingBudget < 0 ? "text-red-600" : "text-emerald-600"}>
                      {formatCurrency(summary.remainingBudget)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs font-bold">
                    {summary.overdueCount > 0 ? (
                      <span className="text-red-600">{summary.overdueCount}</span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </div>
        ) : (
          <EmptyState message="No financial summaries available." />
        )}
      </Card>
      
      {/* Expenses Ledger Table */}
      <Card className="overflow-hidden bg-white">
        <SectionHeading
          title="Expenses Ledger"
          description="Recent spending across your assigned projects"
          action={<TextLink onClick={() => navigate("/expenses")}>View all</TextLink>}
        />
        {expenses.length ? (
          <Table columns={["Date", "Description", "Project", "Category", "Amount", "Status"]}>
            {expenses.slice(0, 10).map((expense) => (
              <tr key={expense.id} className="hover:bg-blueprint-navy/[0.01]">
                <td className="whitespace-nowrap px-5 py-4 text-xs font-mono text-blueprint-navy/80">
                  {formatDate(expense.date)}
                </td>
                <td className="px-5 py-4 text-xs font-bold text-blueprint-navy uppercase tracking-wider font-industry">
                  {expense.description}
                </td>
                <td className="px-5 py-4 text-xs text-blueprint-navy/80 uppercase font-industry">
                  {expense.project?.name || expense.project || "Unassigned"}
                </td>
                <td className="px-5 py-4">
                  <Badge tone="blue">{expense.category}</Badge>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-xs font-bold font-mono text-blueprint-navy">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={expense.approval} />
                </td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyState message="No expenses recorded yet." />
        )}
      </Card>
    </div>
  );
}

// ProjectTable component is unused.

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
