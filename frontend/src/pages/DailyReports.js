import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Field, PageHeader } from "../components/UI";
import { useAppData } from "../context/AppData";
import { workerRoles } from "../data";

const initialRoleCounts = Object.fromEntries(workerRoles.map((role) => [role, 0]));

export default function DailyReports() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { accessibleProjects: projects, addDailyReport, loading, error: loadError } = useAppData();
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    projectId: state?.projectId || "",
    date: new Date().toISOString().slice(0, 10),
    absent: 0,
    progress: 0,
    cement: 0,
    sand: 0,
    remarks: "",
    ...initialRoleCounts,
  });

  const totalPresent = useMemo(
    () => workerRoles.reduce((sum, role) => sum + Number(form[role] || 0), 0),
    [form]
  );

  useEffect(() => {
    if (!form.projectId && projects[0]?.id) {
      setForm((current) => ({ ...current, projectId: state?.projectId || projects[0].id }));
    }
  }, [form.projectId, projects, state?.projectId]);

  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const changeRoleCount = (role, value) => change(role, Math.max(0, Number(value) || 0));

  const submit = (event) => {
    event.preventDefault();
    if (!form.projectId || !form.date || !form.remarks.trim() || totalPresent <= 0) {
      return setFormError("Select a project and enter workers present by role and site remarks.");
    }
    addDailyReport({ ...form, present: totalPresent });
    setFormError("");
    setSaved(true);
  };

  return <>
    <PageHeader title="Daily Site Report" description="Record attendance, material usage, and work completed today." />
    {loadError && <Card className="mb-4 border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{loadError}</Card>}
    <Card className="mx-auto max-w-4xl p-5 sm:p-7">
      {saved ? <div className="py-12 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Daily report submitted</h2>
        <p className="mt-2 text-sm text-slate-500">The project progress and report timeline have been updated.</p>
        <Button className="mt-6" onClick={() => navigate(`/projects/${form.projectId}`)}>View Project Dashboard</Button>
      </div> : <form onSubmit={submit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Project">
            <select className="form-control" value={form.projectId} disabled={loading || !projects.length} onChange={(e) => change("projectId", e.target.value)}>
              {projects.length ? projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>) : <option value="">No projects available</option>}
            </select>
          </Field>
          <Field label="Report Date">
            <input className="form-control" type="date" value={form.date} onChange={(e) => change("date", e.target.value)} />
          </Field>
          <Field label="Workers Present">
            <input className="form-control bg-slate-50 font-semibold" type="number" min="0" value={totalPresent} readOnly />
          </Field>
          <Field label="Workers Absent">
            <input className="form-control" type="number" min="0" value={form.absent} onChange={(e) => change("absent", Number(e.target.value))} />
          </Field>
        </div>

        <h2 className="mb-4 mt-7 border-t border-slate-100 pt-6 font-semibold">Workers Present by Role</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {workerRoles.map((role) => <Field key={role} label={role}>
            <input className="form-control" type="number" min="0" value={form[role]} onChange={(e) => changeRoleCount(role, e.target.value)} />
          </Field>)}
        </div>

        <h2 className="mb-4 mt-7 border-t border-slate-100 pt-6 font-semibold">Usage and Progress</h2>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Cement Used (bags)">
            <input className="form-control" type="number" min="0" value={form.cement} onChange={(e) => change("cement", Number(e.target.value))} />
          </Field>
          <Field label="Sand Used (tons)">
            <input className="form-control" type="number" min="0" step="0.1" value={form.sand} onChange={(e) => change("sand", Number(e.target.value))} />
          </Field>
          <Field label="Overall Progress (%)">
            <input className="form-control" type="number" min="0" max="100" value={form.progress} onChange={(e) => change("progress", Number(e.target.value))} />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Work Completed / Remarks">
            <textarea className="form-control min-h-24" value={form.remarks} onChange={(e) => change("remarks", e.target.value)} placeholder="Example: Concrete pouring completed for Block A" />
          </Field>
        </div>
        {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}
        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={loading || !projects.length}>Submit Daily Report</Button>
        </div>
      </form>}
    </Card>
  </>;
}
