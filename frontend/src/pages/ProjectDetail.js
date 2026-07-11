import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge, Button, Card, EmptyState, LoadingState, PageHeader, ProgressBar, StatusBadge, Table, Modal, Field } from "../components/UI";
import { useAppData } from "../context/AppData";
import { formatCurrency, formatDate, workerRoles } from "../data";

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessibleProjects, workers, materials, expenses, dailyReports, can, loading, error, update, currentUser, authFetch, API_BASE } = useAppData();
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [assistantQuestion, setAssistantQuestion] = useState("");
  const [assistantMessages, setAssistantMessages] = useState([]);
  const [assistantLoading, setAssistantLoading] = useState(false);

  const project = accessibleProjects.find((item) => item.id === id);

  // Status/Progress fields state for PM inline updates
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  const handleOpenEdit = () => {
    if (project) {
      setStatus(project.status || "Active");
      setProgress(project.progress || 0);
      setEditing(true);
    }
  };

  const handleSave = async () => {
    setUpdating(true);
    const result = await update("projects", { ...project, status, progress });
    setUpdating(false);
    if (result?.success !== false) {
      setEditing(false);
    }
  };

  const sendAssistantQuestion = async (questionText) => {
    const trimmedQuestion = (questionText || "").trim();
    if (!trimmedQuestion || assistantLoading) return;

    const userMessage = { id: `user-${Date.now()}`, role: "user", text: trimmedQuestion };
    setAssistantMessages((messages) => [...messages, userMessage]);
    setAssistantQuestion("");
    setAssistantLoading(true);

    try {
      const response = await authFetch(`${API_BASE}/projects/${id}/assistant/ask`, {
        method: "POST",
        body: JSON.stringify({ question: trimmedQuestion }),
      });

      if (!response.ok) {
        const responseText = await response.text().catch(() => "");
        let message = response.status === 503 ? "AI assistant is temporarily unavailable, please try again." : "Could not get an assistant response.";
        if (response.status !== 503) {
          try {
            const errorBody = JSON.parse(responseText);
            message = errorBody.message || errorBody.error || message;
          } catch (e) {
            message = responseText || message;
          }
        }
        throw new Error(message);
      }

      const data = await response.json();
      setAssistantMessages((messages) => [...messages, { id: `assistant-${Date.now()}`, role: "assistant", text: data.answer || "No answer was returned." }]);
    } catch (err) {
      setAssistantMessages((messages) => [...messages, { id: `assistant-error-${Date.now()}`, role: "assistant", text: err.message || "AI assistant is temporarily unavailable, please try again.", error: true }]);
    } finally {
      setAssistantLoading(false);
    }
  };

  const handleAssistantSubmit = (e) => {
    e.preventDefault();
    sendAssistantQuestion(assistantQuestion);
  };

  if (loading) return <Card><LoadingState /></Card>;
  if (!project) return <Card><EmptyState message="Project not found." /></Card>;

  // Safe checks using project name/id
  const projectWorkers = workers.filter(
    (w) =>
      (w.project?.id || w.project) === project.id ||
      (w.project?.name || w.project) === project.name
  );
  const projectExpenses = expenses.filter(
    (e) =>
      (e.project?.id || e.project) === project.id ||
      (e.project?.name || e.project) === project.name
  );
  const reports = dailyReports.filter((report) => report.projectId === id).sort((a, b) => b.date.localeCompare(a.date));
  const latest = reports[0];
  const spent = projectExpenses.reduce((sum, item) => sum + item.amount, 0);
  const canUseAssistant = ["Admin", "Project Manager"].includes(currentUser?.role);

  const workerCounts = workerRoles.map((role) => [role, latest?.[role] ?? projectWorkers.filter((worker) => worker.role === role).length]).filter(([, count]) => count);

  return (
    <>
      <PageHeader
        title={project.name}
        description={`${project.id} · ${project.location}`}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate("/projects")}>Back</Button>
            {can("createProject") && (
              <Button onClick={handleOpenEdit}>Update Progress</Button>
            )}
            {can("dailyReport") && (
              <Button onClick={() => navigate("/daily-reports", { state: { projectId: id } })}>New Daily Report</Button>
            )}
          </div>
        }
      />
      {error && <Card className="mb-4 border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</Card>}
      
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold">Project Details</h2>
              <p className="mt-1 text-xs text-slate-500">Commercial and schedule overview</p>
            </div>
            <StatusBadge status={project.status} />
          </div>
          <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(() => {
              const detailItems = [
                ["Client", project.client],
                ["Location", project.location],
                ["Project Manager", project.manager?.name || project.manager || "Unassigned"],
              ];
              if (currentUser?.role !== "Site Engineer") {
                detailItems.push(["Budget", formatCurrency(project.budget)]);
                detailItems.push(["Spent", formatCurrency(spent)]);
              }
              detailItems.push(["Expected Completion", formatDate(project.end)]);

              return detailItems.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-slate-400">{label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd>
                </div>
              ));
            })()}
          </dl>
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="mb-2 text-sm font-medium">Overall Progress</p>
            <ProgressBar value={project.status === "Completed" ? 100 : Number(project.progress || 0)} />
          </div>
        </Card>
        
        <Card className="p-5">
          <h2 className="font-semibold">Today's Attendance</h2>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded-md bg-emerald-50 p-4">
              <p className="text-xs text-emerald-700">Present Today</p>
              <p className="mt-1 text-2xl font-bold text-emerald-800">{latest?.present ?? projectWorkers.length}</p>
            </div>
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-xs text-red-700">Absent Today</p>
              <p className="mt-1 text-2xl font-bold text-red-800">{latest?.absent ?? 0}</p>
            </div>
          </div>
          <p className="mt-5 text-sm font-medium">Workforce by Role</p>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
            {workerCounts.map(([role, count]) => (
              <div key={role} className="flex justify-between border-b border-slate-100 py-1.5 text-xs">
                <span className="text-slate-500">{role}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className={`mt-5 grid gap-5 lg:grid-cols-${currentUser?.role === "Site Engineer" ? 2 : 3}`}>
        <Card className="p-5">
          <h2 className="font-semibold">Materials and Usage</h2>
          {latest && (
            <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
              Latest usage: {latest.cement} cement bags and {latest.sand} tons of sand.
            </div>
          )}
          <div className="mt-4 space-y-3">
            {materials.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.supplier}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{item.quantity} {item.unit}</p>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Expenses & Approvals Ledger */}
        {currentUser?.role !== "Site Engineer" && (
          <Card className="p-5">
            <h2 className="font-semibold">Expenses & Breakdown</h2>
            <div className="mt-4 max-h-[220px] overflow-y-auto space-y-2">
              {projectExpenses.length ? projectExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between border-b border-slate-100 py-2 text-xs">
                  <div>
                    <p className="font-bold text-slate-800 uppercase">{expense.description}</p>
                    <p className="mt-0.5 font-mono text-slate-400">{formatDate(expense.date)} · {expense.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold font-mono text-slate-800">{formatCurrency(expense.amount)}</span>
                    <StatusBadge status={expense.approval} />
                  </div>
                </div>
              )) : <p className="text-sm text-slate-500">No expenses recorded for this project.</p>}
            </div>
          </Card>
        )}

        {/* Assigned Workers List */}
        <Card className="p-5">
          <h2 className="font-semibold">Assigned Workers</h2>
          <div className="mt-4 max-h-[220px] overflow-y-auto space-y-2">
            {projectWorkers.length ? projectWorkers.map((worker) => (
              <div key={worker.id} className="flex items-center justify-between border-b border-slate-100 py-2 text-xs">
                <div>
                  <p className="font-bold text-slate-800 uppercase">{worker.name}</p>
                  <p className="mt-0.5 font-mono text-slate-400">{worker.role} · {worker.phone}</p>
                </div>
                <StatusBadge status={worker.status} />
              </div>
            )) : <p className="text-sm text-slate-500">No workers assigned to this project.</p>}
          </div>
        </Card>
      </div>

      {canUseAssistant && (
        <Card className="mt-5 p-5">
          <div className="flex flex-col gap-3 border-b border-blueprint-navy/15 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Ask about this project</h2>
              <p className="mt-1 text-xs text-slate-500">Answers use this project's daily reports and profile data.</p>
            </div>
            <Button variant="secondary" onClick={() => setAssistantOpen((open) => !open)}>
              {assistantOpen ? "Collapse" : "Expand"}
            </Button>
          </div>

          {assistantOpen && (
            <div className="mt-5">
              <div className="max-h-80 space-y-3 overflow-y-auto border border-blueprint-navy/15 bg-blueprint-navy/[0.02] p-4">
                {assistantMessages.length ? assistantMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] border px-3.5 py-2 text-sm ${message.role === "user" ? "border-safety-orange/30 bg-safety-orange/10 text-blueprint-navy" : message.error ? "border-red-200 bg-red-50 text-red-700" : "border-blueprint-navy/15 bg-white text-blueprint-navy"}`}>
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500">Ask a question grounded in the project's daily reports.</p>
                )}
                {assistantLoading && (
                  <div className="flex justify-start">
                    <div className="inline-flex items-center gap-2 border border-blueprint-navy/15 bg-white px-3.5 py-2 text-sm text-blueprint-navy/70">
                      <span className="h-3.5 w-3.5 animate-spin border-2 border-blueprint-navy/20 border-t-safety-orange" />
                      Thinking...
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="border border-blueprint-navy/20 bg-white px-3 py-1.5 text-xs font-bold font-industry uppercase tracking-wider text-blueprint-navy hover:bg-blueprint-navy/5 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => {
                    setAssistantQuestion("Summarize progress so far");
                    sendAssistantQuestion("Summarize progress so far");
                  }}
                  disabled={assistantLoading}
                >
                  Summarize progress so far
                </button>
              </div>

              <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleAssistantSubmit}>
                <input
                  className="form-control"
                  value={assistantQuestion}
                  onChange={(e) => setAssistantQuestion(e.target.value)}
                  placeholder="Ask about progress, materials, or site remarks"
                  disabled={assistantLoading}
                />
                <Button type="submit" disabled={assistantLoading || !assistantQuestion.trim()}>
                  Send
                </Button>
              </form>
            </div>
          )}
        </Card>
      )}

      <Card className="mt-5">
        <div className="px-5 py-4">
          <h2 className="font-semibold">Daily Reports</h2>
          <p className="mt-1 text-xs text-slate-500">Latest updates submitted from the site</p>
        </div>
        {reports.length ? (
          <Table columns={["Date", "Workers", "Progress", "Site Update", "Reported By"]}>
            {reports.map((report) => (
              <tr key={report.id}>
                <td className="px-5 py-4">{formatDate(report.date)}</td>
                <td className="px-5 py-4">{report.present} present</td>
                <td className="px-5 py-4"><Badge tone="blue">{report.progress}%</Badge></td>
                <td className="max-w-md px-5 py-4 text-slate-600">{report.remarks}</td>
                <td className="px-5 py-4 font-medium">{report.reportedBy}</td>
              </tr>
            ))}
          </Table>
        ) : (
          <EmptyState message="No daily reports submitted yet." />
        )}
      </Card>

      {/* PM Status/Progress Edit Dialog */}
      {editing && (
        <Modal
          title="Update Project Status & Progress"
          description={`Update details for ${project.id}.`}
          onClose={() => setEditing(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditing(false)} disabled={updating}>Cancel</Button>
              <Button onClick={handleSave} disabled={updating}>{updating ? "Saving..." : "Save Changes"}</Button>
            </>
          }
        >
          <div className="space-y-4 font-sans">
            <Field label="Status">
              <select className="form-control" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </Field>
            <Field label="Progress (%)">
              <input
                className="form-control"
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
              />
            </Field>
          </div>
        </Modal>
      )}
    </>
  );
}
