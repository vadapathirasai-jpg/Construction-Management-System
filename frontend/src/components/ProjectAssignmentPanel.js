import { useState, useEffect, useCallback } from "react";
import { Button, Modal, LoadingState } from "./UI";
import { useAppData } from "../context/AppData";

export default function ProjectAssignmentPanel({ project, onClose }) {
  const { authFetch, users, currentUser } = useAppData();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await authFetch(`http://localhost:8081/projects/${project.id}/assignments`);
      if (response.ok) {
        const list = await response.json();
        setAssignments(list);
      } else {
        setError("Failed to fetch project assignments.");
      }
    } catch (err) {
      setError("Network error fetching assignments.");
    } finally {
      setLoading(false);
    }
  }, [project.id, authFetch]);

  useEffect(() => {
    fetchAssignments();
  }, [project.id, fetchAssignments]);

  const handleAssign = async () => {
    if (!selectedUserId) return;
    setActionLoading(true);
    setError("");
    try {
      const response = await authFetch(`http://localhost:8081/projects/${project.id}/assignments`, {
        method: "POST",
        body: JSON.stringify({ userId: selectedUserId }),
      });
      if (response.ok) {
        setSelectedUserId("");
        fetchAssignments();
      } else {
        const msg = await response.text();
        setError(msg || "Failed to assign user to project.");
      }
    } catch (err) {
      setError("Network error assigning user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (userId) => {
    setActionLoading(true);
    setError("");
    try {
      const response = await authFetch(`http://localhost:8081/projects/${project.id}/assignments/${userId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchAssignments();
      } else {
        const msg = await response.text();
        setError(msg || "Failed to remove assignment.");
      }
    } catch (err) {
      setError("Network error removing assignment.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter users eligible for assignment (Title Case checked)
  const assignedUserIds = new Set(assignments.map((u) => u.id));
  const eligibleUsers = users.filter((u) => {
    const isEligibleRole = ["Project Manager", "Site Engineer", "Accountant"].includes(u.role);
    const isNotAssigned = !assignedUserIds.has(u.id);
    return isEligibleRole && isNotAssigned && u.status === "Active";
  });

  return (
    <Modal
      title={`Manage Team: ${project.name}`}
      description={`Assign Project Managers, Site Engineers, or Accountants to ${project.id}.`}
      onClose={onClose}
      footer={<Button variant="secondary" onClick={onClose}>Close</Button>}
    >
      <div className="space-y-6">
        {error && (
          <div className="border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 flex justify-between items-center">
            <span>{error.toUpperCase()}</span>
            <button onClick={() => setError("")} className="text-red-700 font-bold hover:opacity-80">Dismiss</button>
          </div>
        )}

        {/* Current Assignments List */}
        <div>
          <h3 className="mb-2 text-xs font-bold font-industry uppercase tracking-wider text-blueprint-navy/80">Current Assignments</h3>
          {loading ? (
            <LoadingState />
          ) : assignments.length ? (
            <div className="border border-blueprint-navy/15 divide-y divide-blueprint-navy/10 bg-[#F7F5F0]/20">
              {assignments.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-xs font-bold text-blueprint-navy uppercase tracking-wider font-industry">{user.name}</p>
                    <p className="text-[9px] font-bold text-[#8E9AA6] font-mono uppercase">{user.role} · {user.email}</p>
                  </div>
                  <Button
                    variant="danger"
                    className="h-8 min-h-0 px-3 text-[10px] rounded-none"
                    disabled={actionLoading}
                    onClick={() => handleRemove(user.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-blueprint-navy/15 p-4 text-center text-xs text-blueprint-navy/60 font-semibold uppercase">
              No users currently assigned.
            </div>
          )}
        </div>

        {/* Add Assignment Dropdown Form */}
        <div className="border-t border-blueprint-navy/15 pt-5">
          <h3 className="mb-3 text-xs font-bold font-industry uppercase tracking-wider text-blueprint-navy/80">Add Team Member</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <select
                className="form-control"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={actionLoading}
              >
                <option value="">Select user to assign...</option>
                {eligibleUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleAssign}
              disabled={!selectedUserId || actionLoading}
              className="rounded-none h-10 min-h-0"
            >
              Assign
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
