import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import { Expenses, Materials, Projects, Workers, Vendors, Payments } from "./pages/ListPages";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import ProjectDetail from "./pages/ProjectDetail";
import DailyReports from "./pages/DailyReports";
import { Reports, Users } from "./pages/Administration";
import Verify from "./pages/Verify";
import { useAppData } from "./context/AppData";

function Authorized({ permission, children }) {
  const { can } = useAppData();
  return can(permission) ? children : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<Verify />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/workers" element={<Authorized permission="viewWorkers"><Workers /></Authorized>} />
        <Route path="/materials" element={<Authorized permission="viewMaterials"><Materials /></Authorized>} />
        <Route path="/expenses" element={<Authorized permission="manageExpenses"><Expenses /></Authorized>} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/daily-reports" element={<Authorized permission="dailyReport"><DailyReports /></Authorized>} />
        <Route path="/reports" element={<Authorized permission="viewReports"><Reports /></Authorized>} />
        <Route path="/users" element={<Authorized permission="manageUsers"><Users /></Authorized>} />
        <Route path="/vendors" element={<Authorized permission="viewVendors"><Vendors /></Authorized>} />
        <Route path="/payments" element={<Authorized permission="viewPayments"><Payments /></Authorized>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
