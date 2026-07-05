import { useNavigate } from "react-router-dom";
import { Button, Card, Icon, LoadingState, PageHeader, ProgressBar, StatusBadge, Table } from "../components/UI";
import { useAppData } from "../context/AppData";
import { formatCurrency, formatDate } from "../data";

export default function Dashboard() {
  const navigate = useNavigate();
  const { accessibleProjects: projects, projectScope, workers, materials, expenses, currentUser, can, loading, error } = useAppData();
  const assignedNames = projects.map((project) => project.name);
  const visibleWorkers = currentUser.role === "Admin" || currentUser.role === "Accountant" ? workers : workers.filter((worker) => assignedNames.includes(worker.project));
  const visibleExpenses = currentUser.role === "Admin" || currentUser.role === "Accountant" ? expenses : expenses.filter((expense) => assignedNames.includes(expense.project));
  const totalSpend = visibleExpenses.reduce((sum, item) => sum + item.amount, 0);
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const completedProjects = projects.filter((p) => p.status === "Completed").length;
  const projectProgress = (project) => project.status === "Completed" ? 100 : project.progress;
  const averageProgress = projects.length ? Math.round(projects.reduce((sum, project) => sum + projectProgress(project), 0) / projects.length) : 0;
  const stats = [
    [projectScope.label, projects.length, "projects", projectScope.description],
    ["Active Projects", activeProjects, "progress", "Currently under construction"],
    ["Completed Projects", completedProjects, "check", "Successfully delivered"],
    ["Total Workers", visibleWorkers.length, "workers", `${visibleWorkers.filter((w) => w.status === "On Site").length} currently on site`],
    ["Materials in Inventory", materials.length, "materials", `${materials.filter((m) => m.status === "Low Stock").length} low-stock items`],
    ["Total Expenses", formatCurrency(totalSpend), "expenses", "Recorded expenses in scope"],
  ];
  const quickActions = [["Add Project", "/projects", "projects", "createProject"], ["Add Worker", "/workers", "workers", "manageWorkers"], ["Add Material", "/materials", "materials", "manageMaterials"], ["Add Expense", "/expenses", "expenses", "manageExpenses"], ["Daily Site Report", "/daily-reports", "progress", "dailyReport"]].filter(([, , , permission]) => can(permission));

  return <>
    <PageHeader title={`${currentUser.role} Dashboard`} description={`Welcome, ${currentUser.name}. ${projectScope.description} Workforce, inventory, and spend are scoped to this view where applicable.`} />
    {error && <Card className="mb-4 border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</Card>}
    {loading && <Card className="mb-6"><LoadingState /></Card>}
    <Card className="mb-5 overflow-hidden border-slate-300 bg-slate-950 text-white">
      <div className="grid gap-5 p-5 lg:grid-cols-[1.4fr_1fr] lg:p-6">
        <div>
          <p className="text-xs font-semibold uppercase text-primary-200">Operations Snapshot</p>
          <h2 className="mt-2 text-2xl font-extrabold">Portfolio progress is at {averageProgress}%</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            {projectScope.description} {activeProjects} active projects, {visibleWorkers.filter((w) => w.status === "On Site").length} workers on site, and {materials.filter((m) => m.status === "Low Stock").length} material items need attention.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {[["Spend", formatCurrency(totalSpend)], ["Completed", completedProjects], ["Low Stock", materials.filter((m) => m.status === "Low Stock").length]].map(([label, value]) => (
            <div key={label} className="rounded-md border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs font-medium text-slate-400">{label}</p>
              <p className="mt-1 text-xl font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {stats.map(([label, value, icon, detail]) => <Card key={label} className="p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-2xl font-extrabold text-slate-950">{value}</p></div><span className="rounded-md bg-primary-50 p-2.5 text-primary-800"><Icon name={icon} className="h-5 w-5" /></span></div><p className="mt-4 text-xs font-medium text-slate-500">{detail}</p></Card>)}
    </div>
    <Card className="mt-6 p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="font-semibold text-slate-900">Quick Actions</h2><p className="mt-1 text-xs text-slate-500">Role-approved actions for daily operations.</p></div><div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex">{quickActions.map(([label, path, icon]) => <Button key={label} variant="secondary" onClick={() => navigate(path, { state: { openAdd: path !== "/daily-reports" } })}><Icon name={icon} className="h-4 w-4" />{label}</Button>)}</div></div></Card>
    <div className="mt-6 grid gap-6 xl:grid-cols-5">
      <Card className="xl:col-span-3"><div className="flex items-center justify-between px-5 py-4"><div><h2 className="font-semibold text-slate-900">Recent Projects</h2><p className="mt-0.5 text-xs text-slate-500">Latest projects and their status</p></div><button onClick={() => navigate("/projects")} className="rounded-md px-2 py-1 text-sm font-semibold text-primary-800 hover:bg-primary-50">View all</button></div><Table columns={["Project", "Manager", "Status", "Due Date"]}>{projects.slice(0, 4).map((project) => <tr className="hover:bg-slate-50/70" key={project.id}><td className="px-5 py-4"><p className="font-semibold text-slate-900">{project.name}</p><p className="mt-1 text-xs text-slate-400">{project.id}</p></td><td className="px-5 py-4 text-slate-600">{project.manager}</td><td className="px-5 py-4"><StatusBadge status={project.status} /></td><td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(project.end)}</td></tr>)}</Table></Card>
      <Card className="p-5 xl:col-span-2"><div><h2 className="font-semibold text-slate-900">Project Progress</h2><p className="mt-0.5 text-xs text-slate-500">Active project completion</p></div><div className="mt-6 space-y-6">{projects.slice(0, 4).map((project) => <div key={project.id}><div className="mb-2 flex items-center justify-between gap-3"><p className="truncate text-sm font-semibold text-slate-700">{project.name}</p><span className="whitespace-nowrap rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{project.status === "Completed" ? "Completed" : project.stage}</span></div><ProgressBar value={projectProgress(project)} compact /></div>)}</div></Card>
    </div>
  </>;
}
