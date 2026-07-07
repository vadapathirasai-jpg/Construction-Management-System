export const workerRoles = ["Labourer", "Mason", "Electrician", "Plumber", "Carpenter", "Site Engineer", "Supervisor", "Machine Operator", "Painter"];

export const roleOptions = ["ADMIN", "PROJECT MANAGER", "SITE ENGINEER", "ACCOUNTANT"];

export const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

export const formatDate = (value) => {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
