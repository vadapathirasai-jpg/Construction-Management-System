import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge, Button, Card, EmptyState, Field, Icon, LoadingState, Modal, PageHeader, SearchInput, SelectFilter, StatusBadge, Table } from "../components/UI";
import { useAppData } from "../context/AppData";
import { formatCurrency, formatDate, workerRoles } from "../data";

const definitions = {
  projects: {
    title: "Projects", description: "Manage construction projects, schedules, and budgets.", filterKey: "status", filterLabel: "All statuses", filterOptions: ["Active", "On Hold", "Completed"],
    fields: [["name", "Project Name"], ["client", "Client"], ["location", "Location"], ["manager", "Project Manager", "select", ["Arun Kumar", "Meera Shah", "Vikram Singh", "Priya Nair"]], ["budget", "Budget", "number"], ["start", "Start Date", "date"], ["end", "End Date", "date"], ["status", "Status", "select", ["Active", "On Hold", "Completed"]]],
  },
  workers: {
    title: "Workers", description: "Manage workers, daily wages, and site assignments.", filterKey: "role", filterLabel: "All roles", filterOptions: workerRoles,
    fields: [["name", "Name"], ["role", "Role", "select", workerRoles], ["phone", "Phone"], ["wage", "Daily Wage", "number"], ["project", "Assigned Project"], ["status", "Status", "select", ["On Site", "Available", "On Leave"]]],
  },
  materials: {
    title: "Materials", description: "Track inventory quantities, suppliers, and stock levels.",
    fields: [["name", "Material Name"], ["category", "Category"], ["quantity", "Quantity", "number"], ["unit", "Unit"], ["supplier", "Supplier"], ["cost", "Cost", "number"], ["project", "Project"], ["status", "Stock Status", "select", ["In Stock", "Low Stock", "Out of Stock"]]],
  },
  expenses: {
    title: "Expenses", description: "Review and organize spending across all projects.",
    filterKey: "category", filterLabel: "All categories", filterOptions: ["Materials", "Labor", "Equipment", "Permits", "Transport"],
    fields: [["date", "Date", "date"], ["description", "Description"], ["project", "Project"], ["category", "Category", "select", ["Materials", "Labor", "Equipment", "Permits", "Transport"]], ["amount", "Amount", "number"], ["approval", "Approval", "select", ["Pending", "Approved"]]],
  },
};

function useFilteredRows(rows, filterKey) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [secondaryFilter, setSecondaryFilter] = useState("");
  const [sort, setSort] = useState({ key: "name", direction: "asc" });
  const [loading, setLoading] = useState(true);
  useEffect(() => { const timer = setTimeout(() => setLoading(false), 250); return () => clearTimeout(timer); }, []);
  const filtered = useMemo(() => rows
    .filter((row) => !query || Object.values(row).some((value) => String(value).toLowerCase().includes(query.toLowerCase())))
    .filter((row) => !filter || row[filterKey] === filter)
    .filter((row) => !secondaryFilter || (row.project?.name || row.project) === secondaryFilter)
    .sort((a, b) => {
      const result = String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? ""), undefined, { numeric: true });
      return sort.direction === "asc" ? result : -result;
    }), [rows, query, filter, secondaryFilter, filterKey, sort]);
  const onSort = (key) => setSort((current) => ({ key, direction: current.key === key && current.direction === "asc" ? "desc" : "asc" }));
  return { query, setQuery, filter, setFilter, secondaryFilter, setSecondaryFilter, sort, onSort, filtered, loading };
}

function RecordModal({ type, mode, record, onClose, onSave, saving = false, saveError = "" }) {
  const data = useAppData();
  const config = definitions[type];
  const [values, setValues] = useState(record || {});
  const [errors, setErrors] = useState({});
  const [availableManagers, setAvailableManagers] = useState([]);
  const isView = mode === "view";

  useEffect(() => {
    if (type === "projects") {
      const fetchManagers = async () => {
        try {
          const response = await data.authFetch("http://localhost:8081/projects/managers");
          if (response.ok) {
            const list = await response.json();
            setAvailableManagers(list);
          }
        } catch (err) {
          console.error("Error fetching managers:", err);
        }
      };
      fetchManagers();
    }
  }, [type, data]);

  const submit = async () => {
    const nextErrors = {};
    config.fields.forEach(([key, label]) => { 
      if (values[key] === undefined || values[key] === "" || values[key] === null) {
        nextErrors[key] = `${label} is required`; 
      }
    });
    if (type === "projects" && values.start && values.end && values.end < values.start) nextErrors.end = "End date must be after start date";
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) await onSave(values);
  };

  const fields = config.fields.map(([key, label, typeName = "text", options]) => {
    return [key, label, typeName, options];
  });

  const isManagerDisabled = type === "projects" && data.currentUser?.role === "Project Manager";

  return <Modal title={`${{ add: "Add", edit: "Edit", view: "View" }[mode]} ${config.title.slice(0, -1)}`} description={`${mode === "view" ? "Detailed information for this" : "Enter details below to update this"} ${config.title.slice(0, -1).toLowerCase()} record.`} onClose={onClose} footer={<>{saveError && <p className="mr-auto text-xs font-bold text-red-600 uppercase">{saveError}</p>}{mode === "view" ? <Button onClick={onClose}>Close</Button> : <><Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button><Button onClick={submit} disabled={saving}>{saving ? "Saving..." : "Save Record"}</Button></>}</>}>
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map(([key, label, typeName = "text", options]) => <Field key={key} label={label} error={errors[key]}>
        {key === "manager" && type === "projects" ? (
          <select
            disabled={isView || isManagerDisabled}
            className="form-control disabled:bg-slate-50"
            value={values.manager?.id || (typeof values.manager === "string" ? values.manager : "")}
            onChange={(event) => {
              const val = event.target.value;
              setValues({ ...values, manager: val ? { id: val } : null });
            }}
          >
            <option value="">Select manager</option>
            {availableManagers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        ) : key === "project" && type !== "projects" ? (
          <select
            disabled={isView}
            className="form-control disabled:bg-slate-50"
            value={values.project?.id || (typeof values.project === "string" ? values.project : "")}
            onChange={(event) => {
              const val = event.target.value;
              setValues({ ...values, project: val ? { id: val } : null });
            }}
          >
            <option value="">Select project</option>
            {data.accessibleProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        ) : typeName === "select" ? (
          <select disabled={isView} className="form-control disabled:bg-slate-50" value={values[key] || ""} onChange={(event) => setValues({ ...values, [key]: event.target.value })}><option value="">Select {label.toLowerCase()}</option>{options && options.map((option) => <option key={option} value={option}>{option}</option>)}</select>
        ) : (
          <input disabled={isView} className="form-control disabled:bg-slate-50" type={typeName} min={typeName === "number" ? "0" : undefined} value={values[key] ?? ""} onChange={(event) => setValues({ ...values, [key]: typeName === "number" ? Number(event.target.value) : event.target.value })} />
        )}
      </Field>)}
    </div>
  </Modal>;
}

function Actions({ onView, onEdit, onDelete, onApprove, canManage, canDelete }) {
  return <div className="flex gap-1">{onApprove && <Button variant="secondary" className="px-2 py-1 text-xs" onClick={onApprove}>Approve</Button>}<Button variant="ghost" className="px-2 py-1 text-xs" onClick={onView}>View</Button>{canManage && <Button variant="ghost" className="px-2 py-1 text-xs" onClick={onEdit}>Edit</Button>}{canDelete && <Button variant="danger" className="px-2 py-1 text-xs" onClick={onDelete}>Delete</Button>}</div>;
}

function PageShell({ type, columns, renderRow, extraFilters, summary }) {
  const data = useAppData();
  const location = useLocation();
  const navigate = useNavigate();

  const rows = type === "projects" ? data.accessibleProjects : data[type];
  const config = definitions[type];
  const description = type === "projects" ? `${config.description} ${data.projectScope.description}` : config.description;
  const list = useFilteredRows(rows, config.filterKey);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const permission = { projects: "createProject", workers: "manageWorkers", materials: "manageMaterials", expenses: "manageExpenses" }[type];
  const canManage = data.can(permission);
  useEffect(() => {
    if (location.state?.openAdd) {
      const initialRecord = location.state.projectId ? { project: { id: location.state.projectId } } : null;
      setModal({ mode: "add", record: initialRecord });
      navigate(location.pathname, { replace: true, state: null });
    } else if (location.state?.openEditId) {
      const editRecord = rows.find((r) => r.id === location.state.openEditId);
      if (editRecord) {
        setModal({ mode: "edit", record: editRecord });
      }
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate, rows]);
  const openModal = (nextModal) => { setSaveError(""); setModal(nextModal); };
  const save = async (record) => {
    setSaving(true);
    setSaveError("");
    const result = modal.mode === "add"
      ? await data.add(type, record)
      : await data.update(type, { ...modal.record, ...record });
    setSaving(false);
    if (result?.success === false) {
      setSaveError(result.error || "Could not save the record.");
      return;
    }
    setModal(null);
  };
  const actions = (record) => {
    const canDelete = type === "projects"
      ? data.currentUser.role === "Admin" && record.status === "Completed"
      : data.can("delete");
    return { onView: () => type === "projects" ? navigate(`/projects/${record.id}`) : openModal({ mode: "view", record }), onEdit: () => openModal({ mode: "edit", record }), onDelete: () => { if (window.confirm(`Delete ${record.name || record.description}?`)) data.remove(type, record.id); }, onApprove: type === "expenses" && record.approval === "Pending" && ["Admin", "Project Manager"].includes(data.currentUser.role) ? () => data.update("expenses", { ...record, approval: "Approved" }) : null, canManage, canDelete };
  };
  return <><PageHeader title={config.title} description={description} action={canManage && <Button onClick={() => setModal({ mode: "add", record: null })}><Icon name="plus" className="h-4 w-4" />Add {config.title.slice(0, -1)}</Button>} />
    {data.error && <Card className="mb-4 border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{data.error}</Card>}
    {summary}
    <Card>
      <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
        <SearchInput placeholder={`Search ${type}...`} value={list.query} onChange={(event) => list.setQuery(event.target.value)} />
        {config.filterOptions && <SelectFilter value={list.filter} onChange={(event) => list.setFilter(event.target.value)} options={config.filterOptions} label={config.filterLabel} />}
        {extraFilters?.(list)}
        <span className="ml-auto text-xs font-medium text-slate-500">{list.filtered.length} records</span>
      </div>
      {data.loading || list.loading ? <LoadingState /> : list.filtered.length ? <Table columns={columns} sort={list.sort} onSort={list.onSort}>{list.filtered.map((row) => renderRow(row, <Actions {...actions(row)} />))}</Table> : <EmptyState />}
    </Card>
    {modal && <RecordModal type={type} mode={modal.mode} record={modal.record} onClose={() => setModal(null)} onSave={save} saving={saving} saveError={saveError} />}
  </>;
}

export function Projects() {
  return <PageShell type="projects" columns={[{ label: "Project Name", key: "name" }, { label: "Client", key: "client" }, { label: "Location", key: "location" }, { label: "Budget", key: "budget" }, { label: "Start Date", key: "start" }, { label: "End Date", key: "end" }, { label: "Status", key: "status" }, "Actions"]} renderRow={(p, actions) => <tr key={p.id}><td className="px-5 py-4"><p className="font-medium text-slate-800">{p.name}</p><p className="mt-1 text-xs text-slate-400">{p.id}</p></td><td className="px-5 py-4 text-slate-600">{p.client}</td><td className="px-5 py-4 text-slate-600">{p.location}</td><td className="whitespace-nowrap px-5 py-4 font-medium">{formatCurrency(p.budget)}</td><td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(p.start)}</td><td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(p.end)}</td><td className="px-5 py-4"><StatusBadge status={p.status} /></td><td className="px-5 py-4">{actions}</td></tr>} />;
}

export function Workers() {
  return <PageShell type="workers" columns={[{ label: "Name", key: "name" }, { label: "Role", key: "role" }, "Phone", { label: "Daily Wage", key: "wage" }, { label: "Assigned Project", key: "project" }, { label: "Status", key: "status" }, "Actions"]} renderRow={(w, actions) => <tr key={w.id}><td className="px-5 py-4"><p className="font-medium">{w.name}</p><p className="mt-1 text-xs text-slate-400">{w.id}</p></td><td className="px-5 py-4 text-slate-600">{w.role}</td><td className="whitespace-nowrap px-5 py-4 text-slate-600">{w.phone}</td><td className="px-5 py-4 font-medium">{formatCurrency(w.wage)}</td><td className="px-5 py-4 text-slate-600">{w.project?.name || w.project || "Unassigned"}</td><td className="px-5 py-4"><StatusBadge status={w.status} /></td><td className="px-5 py-4">{actions}</td></tr>} />;
}

export function Materials() {
  return <PageShell type="materials" columns={[{ label: "Material Name", key: "name" }, { label: "Category", key: "category" }, { label: "Quantity", key: "quantity" }, "Unit", { label: "Supplier", key: "supplier" }, { label: "Cost", key: "cost" }, { label: "Stock Status", key: "status" }, "Actions"]} renderRow={(m, actions) => <tr key={m.id}><td className="px-5 py-4"><p className="font-medium">{m.name}</p><p className="mt-1 text-xs text-slate-400">{m.id}</p></td><td className="px-5 py-4 text-slate-600">{m.category}</td><td className="px-5 py-4 font-medium">{m.quantity}</td><td className="px-5 py-4 text-slate-600">{m.unit}</td><td className="px-5 py-4 text-slate-600">{m.supplier}</td><td className="px-5 py-4 font-medium">{formatCurrency(m.cost)}</td><td className="px-5 py-4"><StatusBadge status={m.status} /></td><td className="px-5 py-4">{actions}</td></tr>} />;
}

export function Expenses() {
  const { expenses, accessibleProjects: projects, currentUser } = useAppData();
  const projectNames = projects.map((project) => project.name);
  const visibleExpenses = currentUser?.role === "Project Manager" ? expenses.filter((expense) => projectNames.includes(expense.project?.name || expense.project)) : expenses;
  const total = visibleExpenses.reduce((sum, item) => sum + item.amount, 0);
  const summary = <div className="mb-6 grid gap-4 sm:grid-cols-3"><Card className="p-5"><p className="text-sm text-slate-500">Total Recorded</p><p className="mt-2 text-2xl font-bold">{formatCurrency(total)}</p></Card><Card className="p-5"><p className="text-sm text-slate-500">This Month</p><p className="mt-2 text-2xl font-bold">{formatCurrency(total)}</p></Card><Card className="p-5"><p className="text-sm text-slate-500">Largest Expense</p><p className="mt-2 text-2xl font-bold">{formatCurrency(visibleExpenses.length ? Math.max(...visibleExpenses.map((item) => item.amount)) : 0)}</p></Card></div>;
  return <PageShell type="expenses" summary={summary} columns={["Expense ID", { label: "Date", key: "date" }, { label: "Description", key: "description" }, { label: "Project", key: "project" }, { label: "Category", key: "category" }, { label: "Amount", key: "amount" }, { label: "Approval", key: "approval" }, "Actions"]} extraFilters={(list) => <SelectFilter value={list.secondaryFilter} onChange={(event) => list.setSecondaryFilter(event.target.value)} options={projects.map((project) => project.name)} label="All projects" />} renderRow={(e, actions) => <tr key={e.id}><td className="px-5 py-4 text-xs text-slate-500">{e.id}</td><td className="whitespace-nowrap px-5 py-4">{formatDate(e.date)}</td><td className="px-5 py-4 font-medium">{e.description}</td><td className="px-5 py-4 text-slate-600">{e.project?.name || e.project || "Unassigned"}</td><td className="px-5 py-4"><Badge tone="blue">{e.category}</Badge></td><td className="px-5 py-4 font-semibold">{formatCurrency(e.amount)}</td><td className="px-5 py-4"><StatusBadge status={e.approval} /></td><td className="px-5 py-4">{actions}</td></tr>} />;
}
