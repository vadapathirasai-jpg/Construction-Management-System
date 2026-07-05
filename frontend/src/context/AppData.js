import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AppDataContext = createContext(null);
const API_BASE = "http://localhost:8080";

export function AppDataProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [currentUser, setCurrentUser] = useState(
    localStorage.getItem("currentUser") ? JSON.parse(localStorage.getItem("currentUser")) : null
  );

  const logout = useCallback(() => {
    setToken("");
    setCurrentUser(null);
    setLoading(false);
    setError("");
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
  }, []);

  const authFetch = useCallback(async (url, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    try {
      const response = await fetch(url, { ...options, headers });
      if (response.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }
      return response;
    } catch (err) {
      console.error(`Fetch error for ${url}:`, err);
      throw err;
    }
  }, [token, logout]);

  const readCollection = useCallback(async (path) => {
    const response = await authFetch(`${API_BASE}/${path}`);
    if (!response.ok) {
      throw new Error(`${path} returned ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }, [authFetch]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    const collections = [
      ["projects", "projects", setProjects],
      ["workers", "workers", setWorkers],
      ["materials", "materials", setMaterials],
      ["expenses", "expenses", setExpenses],
      ["daily reports", "daily-reports", setDailyReports],
    ];

    try {
      const failedCollections = (await Promise.all(collections.map(async ([label, path, setter]) => {
        try {
          setter(await readCollection(path));
          return "";
        } catch (err) {
          console.error(`Error loading ${label} from backend:`, err);
          setter([]);
          return label;
        }
      }))).filter(Boolean);

      if (currentUser?.role === "Admin") {
        try {
          setUsers(await readCollection("users"));
        } catch (err) {
          console.error("Error loading users from backend:", err);
          setUsers([]);
          failedCollections.push("users");
        }
      } else {
        setUsers([]);
      }

      if (failedCollections.length) {
        setError(`Could not load ${failedCollections.join(", ")} from the database.`);
      }
    } catch (err) {
      console.error("Error loading data from backend:", err);
      setError("Could not load data from the database.");
    } finally {
      setLoading(false);
    }
  }, [token, currentUser?.role, readCollection]);

  useEffect(() => {
    if (token) {
      fetchData();
    } else {
      setProjects([]);
      setWorkers([]);
      setMaterials([]);
      setExpenses([]);
      setDailyReports([]);
      setUsers([]);
      setError("");
      setLoading(false);
    }
  }, [token, fetchData]);

  const add = async (type, record) => {
    const defaults = type === "projects" ? { manager: "Unassigned", progress: 0, stage: "Planning" } : {};
    const generatedId = `${type.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const newRecord = normalizeRecord(type, { ...defaults, ...record, id: generatedId });

    try {
      const response = await authFetch(`${API_BASE}/${type}`, {
        method: "POST",
        body: JSON.stringify(newRecord),
      });
      if (response.ok) {
        await fetchData();
        setError("");
        return { success: true };
      } else {
        const message = await response.text().catch(() => "");
        const errorMessage = message || `Failed to save new ${type}.`;
        console.error(errorMessage);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error(`Error adding ${type}:`, err);
      const errorMessage = `Could not save ${type}. Please check the backend connection.`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const update = async (type, record) => {
    const isProjectUpdate = type === "projects";
    const url = isProjectUpdate ? `${API_BASE}/${type}/${record.id}` : `${API_BASE}/${type}`;
    const nextRecord = normalizeRecord(type, record);
    
    try {
      const response = await authFetch(url, {
        method: "PUT",
        body: JSON.stringify(nextRecord),
      });
      if (response.ok) {
        const updatedRecord = await response.json().catch(() => null);
        if (type === "users" && record.id === currentUser?.id && updatedRecord) {
          setCurrentUser(updatedRecord);
          localStorage.setItem("currentUser", JSON.stringify(updatedRecord));
        }
        await fetchData();
        setError("");
        return { success: true, data: updatedRecord };
      } else {
        const message = await response.text().catch(() => "");
        const errorMessage = message || `Failed to update ${type}.`;
        console.error(errorMessage);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      console.error(`Error updating ${type}:`, err);
      const errorMessage = `Could not update ${type}. Please check the backend connection.`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const remove = async (type, id) => {
    try {
      const response = await authFetch(`${API_BASE}/${type}/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchData();
      } else {
        console.error(`Failed to delete ${type} with id ${id}`);
      }
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
    }
  };

  const addDailyReport = async (report) => {
    const generatedId = `RPT-${Date.now().toString().slice(-4)}`;
    const newReport = { ...report, id: generatedId, reportedBy: currentUser?.name || "Unknown" };

    try {
      const response = await authFetch(`${API_BASE}/daily-reports`, {
        method: "POST",
        body: JSON.stringify(newReport),
      });
      if (response.ok) {
        // Update the project's progress and stage on the backend/frontend
        const project = projects.find((p) => p.id === report.projectId);
        if (project) {
          const updatedProject = { ...project, progress: Number(report.progress), stage: report.remarks };
          await update("projects", updatedProject);
        }
        await fetchData();
      } else {
        console.error("Failed to submit daily report");
      }
    } catch (err) {
      console.error("Error adding daily report:", err);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        return { success: true };
      } else {
        const errData = await response.json().catch(() => ({}));
        return { success: false, error: errData.error || "Invalid credentials" };
      }
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: "Authentication server is unreachable." };
    }
  };

  const register = async (user) => {
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, status: "Active" }),
      });
      if (response.ok) {
        return { success: true };
      }
      const errData = await response.json().catch(async () => ({ error: await response.text().catch(() => "") }));
      return { success: false, error: errData.error || "Registration failed." };
    } catch (err) {
      console.error("Registration error:", err);
      return { success: false, error: "Registration server is unreachable." };
    }
  };

  const permissions = {
    Admin: ["manageUsers", "createProject", "manageWorkers", "manageMaterials", "manageExpenses", "viewReports", "dailyReport", "delete"],
    "Project Manager": ["createProject", "manageWorkers", "manageMaterials", "manageExpenses", "viewReports", "dailyReport"],
    "Site Engineer": ["viewReports", "dailyReport"],
    Accountant: ["manageExpenses", "viewReports"],
  };
  const can = (permission) => {
    if (!currentUser) return false;
    return permissions[currentUser.role]?.includes(permission);
  };
  const projectManagerProjects = projects.filter((project) => project.manager === currentUser?.name);
  const assignedProjectNames = new Set(workers.filter((worker) => worker.name === currentUser?.name).map((worker) => worker.project).filter(Boolean));
  const siteEngineerProjects = projects.filter((project) => assignedProjectNames.has(project.name));
  const accessibleProjects = !currentUser ? []
    : currentUser.role === "Project Manager"
      ? projectManagerProjects
      : currentUser.role === "Site Engineer"
        ? siteEngineerProjects
        : projects;
  const projectScope = !currentUser ? { label: "Projects", description: "No project scope available.", isScoped: false }
    : currentUser.role === "Admin" || currentUser.role === "Accountant"
      ? { label: "All Projects", description: `Showing all ${projects.length} projects.`, isScoped: false }
      : { label: "Assigned Projects", description: `Showing ${accessibleProjects.length} assigned of ${projects.length} total projects.`, isScoped: true };

  return <AppDataContext.Provider value={{ projects, accessibleProjects, projectScope, workers, materials, expenses, dailyReports, users, currentUser, token, loading, error, refresh: fetchData, login, register, logout, can, addDailyReport, add, update, remove }}>{children}</AppDataContext.Provider>;
}

export const useAppData = () => useContext(AppDataContext);

function normalizeRecord(type, record) {
  if (type !== "projects" || record.status !== "Completed") {
    return record;
  }
  return { ...record, progress: 100, stage: "Completed" };
}
