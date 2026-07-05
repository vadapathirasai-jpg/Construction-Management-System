import { Badge, Card, EmptyState, LoadingState, PageHeader, ProgressBar } from "../components/UI";
import { useAppData } from "../context/AppData";
import { formatDate } from "../data";

export default function Progress() {
  const { accessibleProjects: projects, projectScope, loading, error } = useAppData();
  return <><PageHeader title="Project Progress" description={`Monitor completion, current stages, and project schedules. ${projectScope.description}`} />{error && <Card className="mb-4 border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</Card>}{loading ? <Card><LoadingState /></Card> : projects.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{projects.map((p) => {
    const isCompleted = p.status === "Completed";
    const progress = isCompleted ? 100 : p.progress;
    const stage = isCompleted ? "Completed" : p.stage;
    return <Card key={p.id} className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-medium text-slate-400">{p.id}</p><h2 className="mt-1 font-semibold text-slate-900">{p.name}</h2><p className="mt-1 text-sm text-slate-500">{p.client}</p></div><Badge tone={isCompleted ? "green" : "blue"}>{isCompleted ? "Complete" : "In progress"}</Badge></div><div className="mt-6"><div className="mb-2 flex justify-between text-xs"><span className="font-medium text-slate-500">Overall completion</span><span className="font-semibold text-slate-700">{progress}%</span></div><ProgressBar value={progress} compact /></div><div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4"><div><p className="text-xs text-slate-400">Current stage</p><p className="mt-1 text-sm font-medium text-slate-700">{stage}</p></div><div><p className="text-xs text-slate-400">Expected completion</p><p className="mt-1 text-sm font-medium text-slate-700">{formatDate(p.end)}</p></div></div></Card>;
  })}</div> : <Card><EmptyState message="No project progress is available." /></Card>}</>;
}
