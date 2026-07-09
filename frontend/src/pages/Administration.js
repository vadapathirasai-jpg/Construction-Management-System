import { useState } from "react";
import { Badge, Button, Card, EmptyState, Field, Icon, LoadingState, Modal, PageHeader, StatusBadge, Table, Switch } from "../components/UI";
import { useAppData } from "../context/AppData";
import { formatCurrency, roleOptions } from "../data";

export function Reports() {
  const { accessibleProjects: projects, expenses, dailyReports, loading, error } = useAppData();
  const names = projects.map((project) => project.name);
  const visibleExpenses = expenses.filter((expense) => names.includes(expense.project?.name || expense.project));
  const totalBudget = projects.reduce((sum, item) => sum + item.budget, 0);
  const totalSpent = visibleExpenses.reduce((sum, item) => sum + item.amount, 0);
  return <><PageHeader title="Management Reports" description="High-level project delivery and cost information." />{error && <Card className="mb-4 border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</Card>}{loading ? <Card><LoadingState /></Card> : <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Portfolio Budget", formatCurrency(totalBudget)], ["Recorded Expenses", formatCurrency(totalSpent)], ["Budget Utilized", `${totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0}%`], ["Daily Reports", dailyReports.filter((report) => projects.some((project) => project.id === report.projectId)).length]].map(([label, value]) => <Card key={label} className="p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></Card>)}</div><Card className="mt-6"><div className="px-5 py-4"><h2 className="font-semibold">Project Cost Report</h2></div><Table columns={["Project", "Manager", "Budget", "Recorded Expenses", "Progress"]}>{projects.map((project) => { const spent = visibleExpenses.filter((item) => (item.project?.name || item.project) === project.name).reduce((sum, item) => sum + item.amount, 0); return <tr key={project.id}><td className="px-5 py-4 font-medium">{project.name}</td><td className="px-5 py-4 text-slate-600">{project.manager?.name || project.manager || "Unassigned"}</td><td className="px-5 py-4">{formatCurrency(project.budget)}</td><td className="px-5 py-4">{formatCurrency(spent)}</td><td className="px-5 py-4"><Badge tone="blue">{project.progress}%</Badge></td></tr>; })}</Table></Card></>}</>;
}

export function Users() {
  const { users, add, remove, update, loading, error: loadError, currentUser } = useAppData();
  const blankForm = { name: "", email: "", password: "", confirmPassword: "", role: "", status: "Active" };
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [error, setError] = useState("");
  const save = () => {
    if (!form.name.trim() || !form.email.includes("@") || !form.role) return setError("Enter a valid name, email, and role.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    const { confirmPassword, ...user } = form;
    add("users", user); setOpen(false); setForm(blankForm); setError("");
  };
  return <><PageHeader title="User Management" description="Manage system users and their assigned roles." action={<Button onClick={() => setOpen(true)}><Icon name="plus" className="h-4 w-4" />Add User</Button>} />{loadError && <Card className="mb-4 border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{loadError}</Card>}<Card>{loading ? <LoadingState /> : users.length ? <Table columns={["User", "Email", "Role", "Status", "Actions"]}>{users.map((user) => <tr key={user.id}><td className="px-5 py-4 font-medium">{user.name}</td><td className="px-5 py-4 text-slate-600">{user.email}</td><td className="px-5 py-4"><Badge tone="blue">{user.role}</Badge></td><td className="px-5 py-4"><div className="flex items-center gap-3.5"><Switch checked={user.status === "Active"} onChange={(val) => update("users", { ...user, status: val ? "Active" : "Disabled" })} disabled={user.id === currentUser?.id} /><StatusBadge status={user.status} /></div></td><td className="px-5 py-4"><Button variant="danger" className="px-3 py-1 text-xs rounded-lg" onClick={() => remove("users", user.id)}>Delete</Button></td></tr>)}</Table> : <EmptyState message="No users are registered." />}</Card>{open && <Modal title="Add System User" description="Create a local demo user and assign their role." onClose={() => setOpen(false)} footer={<><Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Add User</Button></>}><div className="space-y-5"><Field label="Full Name"><input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field><Field label="Email"><input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field><Field label="Password"><input className="form-control" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field><Field label="Confirm Password"><input className="form-control" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} /></Field><Field label="Role"><select className="form-control" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="">Select role</option>{roleOptions.map((role) => <option key={role}>{role}</option>)}</select></Field>{error && <p className="text-sm text-red-600">{error}</p>}</div></Modal>}</>;
}
