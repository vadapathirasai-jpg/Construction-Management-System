import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Field, PageHeader } from "../components/UI";
import { useAppData } from "../context/AppData";
import { workerRoles } from "../data";

const initialRoleCounts = Object.fromEntries(workerRoles.map((role) => [role, 0]));

export default function DailyReports() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { accessibleProjects: projects, addDailyReport, loading, error: loadError, authFetch } = useAppData();
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState("");
  const [polishLoading, setPolishLoading] = useState(false);
  const [polishHint, setPolishHint] = useState("");
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

  const polishRemarks = async () => {
    const notesText = form.remarks.trim();
    if (!notesText) {
      setPolishHint("Type some notes first");
      setTimeout(() => setPolishHint(""), 3000);
      return;
    }
    setPolishLoading(true);
    setPolishHint("");
    try {
      const response = await authFetch("http://localhost:8081/daily-reports/polish-remarks", {
        method: "POST",
        body: JSON.stringify({ notes: notesText }),
      });
      if (response.ok) {
        const data = await response.json();
        change("remarks", data.polished);
      } else {
        setPolishHint("AI unavailable, please write manually");
        setTimeout(() => setPolishHint(""), 4000);
      }
    } catch (err) {
      setPolishHint("AI unavailable, please write manually");
      setTimeout(() => setPolishHint(""), 4000);
    } finally {
      setPolishLoading(false);
    }
  };

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
  const changeRoleCount = (role, value) => {
    if (value === "") {
      change(role, "");
    } else {
      change(role, Math.max(0, Number(value) || 0));
    }
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.projectId || !form.date || !form.remarks.trim() || totalPresent <= 0) {
      return setFormError("Select a project and enter workers present by role and site remarks.");
    }
    
    // Create a normalized copy of form data for the backend API
    const normalizedForm = { ...form, present: totalPresent };
    workerRoles.forEach((role) => {
      normalizedForm[role] = Number(form[role]) || 0;
    });
    normalizedForm.absent = Number(form.absent) || 0;
    normalizedForm.cement = Number(form.cement) || 0;
    normalizedForm.sand = Number(form.sand) || 0;
    normalizedForm.progress = Number(form.progress) || 0;

    addDailyReport(normalizedForm);
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
            <input className="form-control" type="number" min="0" value={form.absent} onChange={(e) => change("absent", e.target.value === "" ? "" : Number(e.target.value))} />
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
            <input className="form-control" type="number" min="0" value={form.cement} onChange={(e) => change("cement", e.target.value === "" ? "" : Number(e.target.value))} />
          </Field>
          <Field label="Sand Used (tons)">
            <input className="form-control" type="number" min="0" step="0.1" value={form.sand} onChange={(e) => change("sand", e.target.value === "" ? "" : Number(e.target.value))} />
          </Field>
          <Field label="Overall Progress (%)">
            <input className="form-control" type="number" min="0" max="100" value={form.progress} onChange={(e) => change("progress", e.target.value === "" ? "" : Number(e.target.value))} />
          </Field>
        </div>

        <div className="mt-5">
          <Field 
            label={
              <span className="flex items-center justify-between w-full">
                <span>Work Completed / Remarks</span>
                <span className="flex items-center gap-2 normal-case font-sans">
                  {polishHint && <span className="text-[10px] text-amber-600 font-medium">{polishHint}</span>}
                  <button
                    type="button"
                    onClick={polishRemarks}
                    disabled={polishLoading}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-600 hover:text-sky-700 disabled:opacity-50"
                  >
                    {polishLoading ? (
                      <span className="flex items-center gap-1">
                        <svg className="animate-spin h-3 w-3 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Polishing...
                      </span>
                    ) : (
                      "✨ Polish with AI"
                    )}
                  </button>
                </span>
              </span>
            }
          >
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
