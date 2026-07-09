import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppData";
import { Card, EmptyState, LoadingState } from "./UI";
import { formatCurrency, formatDate } from "../data";

export default function GanttChart() {
  const navigate = useNavigate();
  const { authFetch, API_BASE } = useAppData();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let active = true;
    const fetchGantt = async () => {
      try {
        const response = await authFetch(`${API_BASE}/projects/gantt-summary`);
        if (response.ok) {
          const json = await response.json();
          if (active) {
            setData(json);
          }
        }
      } catch (err) {
        console.error("Error loading Gantt summaries:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchGantt();
    return () => {
      active = false;
    };
  }, [authFetch, API_BASE]);

  if (loading) return <Card className="p-6"><LoadingState /></Card>;

  const activeProjects = data.filter((p) => p.status === "Active");

  if (!activeProjects.length) {
    return (
      <Card className="p-6 mb-6 bg-white">
        <h2 className="text-sm font-extrabold font-industry tracking-widest text-blueprint-navy uppercase mb-4">SITE SCHEDULING TIMELINE</h2>
        <EmptyState message="No active projects on site schedule." />
      </Card>
    );
  }

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
  const earliestTime = Math.min(...startTimes);
  const latestTime = Math.max(...endTimes);

  const earliestDate = new Date(earliestTime - 5 * 24 * 60 * 60 * 1000);
  const latestDate = new Date(latestTime + 5 * 24 * 60 * 60 * 1000);
  const chartDuration = latestDate.getTime() - earliestDate.getTime();

  const months = [];
  let current = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
  const endMonth = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
  while (current <= endMonth) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }

  const handleMouseMove = (e) => {
    setTooltipPos({ x: e.clientX + 15, y: e.clientY + 15 });
  };

  return (
    <Card className="p-5 mb-6 overflow-hidden bg-white relative">
      <div className="flex items-center justify-between border-b border-blueprint-navy/15 pb-3.5 mb-4">
        <div>
          <h2 className="text-sm font-extrabold font-industry tracking-widest text-blueprint-navy uppercase leading-none">SITE OVERVIEW GANTT CHART</h2>
          <p className="text-[10px] font-bold text-[#8E9AA6] uppercase tracking-wider font-industry mt-1">
            Gantt scheduling based on real reported progress, budget flags, and material stock alerts
          </p>
        </div>
      </div>

      <div className="overflow-x-auto" onMouseMove={handleMouseMove}>
        <div className="min-w-[900px] relative pb-2 pt-4">
          
          {/* Monthly Columns Header */}
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

          {/* Project Gantt Rows */}
          <div className="space-y-4 pt-2">
            {projectData.map((project) => {
              const left = ((project.startDate.getTime() - earliestDate.getTime()) / chartDuration) * 100;
              const width = ((project.endDate.getTime() - project.startDate.getTime()) / chartDuration) * 100;
              const progress = Number(project.reportedProgress || 0);

              return (
                <div key={project.id} className="flex items-center group/row">
                  
                  {/* Left Label */}
                  <button 
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="w-48 pr-4 text-left group shrink-0"
                  >
                    <p className="text-xs font-bold text-blueprint-navy uppercase tracking-wider group-hover:text-safety-orange truncate leading-tight">
                      {project.name}
                    </p>
                    <p className="text-[9px] font-bold text-[#8E9AA6] uppercase tracking-widest mt-0.5">
                      {project.stage || "FIELD"}
                    </p>
                  </button>

                  {/* SVG Bar Track */}
                  <div className="flex-1 bg-blueprint-navy/[0.02] border-y border-blueprint-navy/[0.05] h-10 relative flex items-center">
                    
                    {/* Grid lines */}
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

                    {/* Gantt Bar */}
                    <div 
                      onClick={() => navigate(`/projects/${project.id}`)}
                      onMouseEnter={() => setHovered(project)}
                      onMouseLeave={() => setHovered(null)}
                      className="absolute h-7 bg-slate-100 hover:bg-slate-200 border border-blueprint-navy/10 rounded-sm cursor-pointer overflow-hidden flex items-center transition-colors shadow-sm"
                      style={{ 
                        left: `${Math.max(0, Math.min(100, left))}%`, 
                        width: `${Math.max(3, Math.min(100 - left, width))}%` 
                      }}
                    >
                      {/* Reported progress fill */}
                      <div 
                        className="h-full bg-blueprint-navy/70 border-r border-blueprint-navy"
                        style={{ width: `${progress}%` }}
                      />

                      {/* Display Progress Text Inside if fits */}
                      <span className="absolute left-2 text-[9px] font-bold text-blueprint-navy select-none mix-blend-difference font-mono">
                        {progress}%
                      </span>

                      {/* Risk Icons Overlay */}
                      <div className="absolute right-2 flex items-center gap-1.5 bg-white/85 px-1.5 py-0.5 rounded shadow-sm">
                        {project.isBudgetOverrunRisk && (
                          <span 
                            title="BUDGET WARNING: Spending is disproportionately high compared to reported progress."
                            className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-white text-[8px] font-bold"
                          >
                            !
                          </span>
                        )}
                        {project.isMaterialRisk && (
                          <span 
                            title={`MATERIAL ALERT: Shortage detected. Status: ${project.materialsStatus}.`}
                            className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-white text-[8px] font-bold"
                          >
                            M
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Floating Tooltip */}
      {hovered && (
        <div 
          className="fixed z-50 bg-[#0F1E2E] text-white p-3.5 shadow-2xl border border-white/10 text-xs rounded-none font-sans min-w-[240px]"
          style={{ 
            left: `${tooltipPos.x}px`, 
            top: `${tooltipPos.y}px` 
          }}
        >
          <div className="border-b border-white/10 pb-1.5 mb-1.5">
            <h4 className="font-extrabold uppercase font-industry tracking-wider text-safety-orange text-sm leading-tight">{hovered.name}</h4>
            <p className="text-[9px] font-mono text-slate-400 mt-0.5">ID: {hovered.id} · CLIENT: {hovered.client}</p>
          </div>

          <div className="space-y-1 text-slate-300">
            <p className="flex justify-between">
              <span>Start:</span>
              <strong className="text-white font-mono">{formatDate(hovered.start)}</strong>
            </p>
            <p className="flex justify-between">
              <span>End:</span>
              <strong className="text-white font-mono">{formatDate(hovered.end)}</strong>
            </p>
            <p className="flex justify-between border-t border-white/5 pt-1 mt-1">
              <span>Reported Progress:</span>
              <strong className="text-emerald-400 font-mono">{hovered.reportedProgress}%</strong>
            </p>
            <p className="text-[9px] text-slate-400 text-right leading-none">Source: {hovered.progressSource}</p>

            {/* Scoped Budget Display */}
            {hovered.budget !== null && (
              <>
                <p className="flex justify-between border-t border-white/5 pt-1 mt-1">
                  <span>Spent:</span>
                  <strong className="text-white font-mono">{formatCurrency(hovered.spent)}</strong>
                </p>
                <p className="flex justify-between">
                  <span>Budget:</span>
                  <strong className="text-white font-mono">{formatCurrency(hovered.budget)}</strong>
                </p>
                <p className="flex justify-between">
                  <span>Budget Used:</span>
                  <strong className={`${hovered.isBudgetOverrunRisk ? 'text-rose-400 font-bold' : 'text-white'} font-mono`}>
                    {hovered.budgetUsedPercent}%
                  </strong>
                </p>
              </>
            )}

            {/* Materials Status */}
            <div className="border-t border-white/5 pt-1.5 mt-1">
              <p className="flex justify-between">
                <span>Materials Status:</span>
                <span className={`font-bold ${hovered.isMaterialRisk ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {hovered.materialsStatus}
                </span>
              </p>
              {hovered.isMaterialRisk && hovered.lowStockMaterials?.length > 0 && (
                <p className="text-[9px] text-amber-300 mt-0.5">
                  Critical: {hovered.lowStockMaterials.join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
