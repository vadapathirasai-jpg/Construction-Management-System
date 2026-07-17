const fs = require('fs');
let content = fs.readFileSync('src/context/AppData.js', 'utf8');

// Chunk 1
content = content.replace(
  'import { createContext, useContext, useState, useEffect, useCallback } from "react";',
  'import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";'
);
content = content.replace(
  'const API_BASE = "http://localhost:8081";',
  'const API_BASE = "http://localhost:8081";\n\nconst permissions = {\n  Admin: ["manageUsers", "createProject", "manageWorkers", "manageMaterials", "manageExpenses", "viewReports", "dailyReport", "delete", "viewWorkers", "viewMaterials", "manageMilestones", "viewMilestones", "manageVendors", "managePayments", "viewPayments", "viewVendors"],\n  "Project Manager": ["manageMaterials", "manageExpenses", "viewReports", "dailyReport", "viewWorkers", "viewMaterials", "manageMilestones", "viewMilestones", "approvePayments", "viewPayments"],\n  "Site Engineer": ["manageWorkers", "viewReports", "dailyReport", "viewWorkers", "viewMaterials", "viewMilestones", "createPayment", "viewPayments"],\n  Accountant: ["manageExpenses", "viewReports", "viewMilestones", "manageVendors", "processPayments", "viewPayments", "viewVendors"],\n};'
);

// Chunk 2
content = content.replace(
  '  const setCurrentUser = (user) => {',
  '  const setCurrentUser = useCallback((user) => {'
);
content = content.replace(
  '    setCurrentUserRaw(user);\n  };',
  '    setCurrentUserRaw(user);\n  }, []);'
);

// Chunk 3
content = content.replace('const add = async (type, record) => {', 'const add = useCallback(async (type, record) => {');
content = content.replace('    }\n  };\n\n  const update = async (type, record) => {', '    }\n  }, [authFetch, fetchData]);\n\n  const update = useCallback(async (type, record) => {');
content = content.replace('    }\n  };\n\n  const remove = async (type, id) => {', '    }\n  }, [authFetch, currentUser, fetchData, setCurrentUser]);\n\n  const remove = useCallback(async (type, id) => {');
content = content.replace('    }\n  };\n\n  const addDailyReport = async (report) => {', '    }\n  }, [authFetch, fetchData]);\n\n  const addDailyReport = useCallback(async (report) => {');
content = content.replace('    }\n  };\n\n  const getMilestones = useCallback(async (projectId) => {', '    }\n  }, [currentUser, authFetch, projects, update, fetchData]);\n\n  const getMilestones = useCallback(async (projectId) => {');

// Chunk 4
content = content.replace('const addMilestone = async (projectId, milestone) => {', 'const addMilestone = useCallback(async (projectId, milestone) => {');
content = content.replace('    }\n  };\n\n  const updateMilestone = async (milestone) => {', '    }\n  }, [authFetch, fetchData]);\n\n  const updateMilestone = useCallback(async (milestone) => {');
content = content.replace('    }\n  };\n\n  const removeMilestone = async (milestoneId) => {', '    }\n  }, [authFetch, fetchData]);\n\n  const removeMilestone = useCallback(async (milestoneId) => {');
content = content.replace('    }\n  };\n\n  const login = async (email, password) => {', '    }\n  }, [authFetch, fetchData]);\n\n  const login = useCallback(async (email, password) => {');

// Chunk 5
content = content.replace('    }\n  };\n\n  const register = async (user) => {', '    }\n  }, [setCurrentUser]);\n\n  const register = useCallback(async (user) => {');
content = content.replace('    }\n  };\n\n  const resendVerification = async (email) => {', '    }\n  }, []);\n\n  const resendVerification = useCallback(async (email) => {');
content = content.replace('    }\n  };\n\n  const verifyUser = async (email, otp) => {', '    }\n  }, []);\n\n  const verifyUser = useCallback(async (email, otp) => {');

// Chunk 6
let oldPermissionsBlock = '  const permissions = {\n    Admin: ["manageUsers", "createProject", "manageWorkers", "manageMaterials", "manageExpenses", "viewReports", "dailyReport", "delete", "viewWorkers", "viewMaterials", "manageMilestones", "viewMilestones", "manageVendors", "managePayments", "viewPayments", "viewVendors"],\n    "Project Manager": ["manageMaterials", "manageExpenses", "viewReports", "dailyReport", "viewWorkers", "viewMaterials", "manageMilestones", "viewMilestones", "approvePayments", "viewPayments"],\n    "Site Engineer": ["manageWorkers", "viewReports", "dailyReport", "viewWorkers", "viewMaterials", "viewMilestones", "createPayment", "viewPayments"],\n    Accountant: ["manageExpenses", "viewReports", "viewMilestones", "manageVendors", "processPayments", "viewPayments", "viewVendors"],\n  };\n  const can = (permission) => {\n    if (!currentUser) return false;\n    return permissions[currentUser.role]?.includes(permission);\n  };';
let newCanBlock = '    }\n  }, []);\n\n  const can = useCallback((permission) => {\n    if (!currentUser) return false;\n    return permissions[currentUser.role]?.includes(permission);\n  }, [currentUser]);';
content = content.replace('    }\n  };\n\n' + oldPermissionsBlock, newCanBlock);

// Chunk 7
let oldProvider = 'return <AppDataContext.Provider value={{ projects, accessibleProjects, projectScope, workers: filteredWorkers, materials: filteredMaterials, expenses: filteredExpenses, dailyReports: filteredDailyReports, users, vendors, payments: filteredPayments, financialSummaries, currentUser, token, loading, error, refresh: fetchData, login, register, resendVerification, verifyUser, logout, can, addDailyReport, add, update, remove, authFetch, API_BASE, getMilestones, addMilestone, updateMilestone, removeMilestone }}>{children}</AppDataContext.Provider>;}';
let newProvider = 'const contextValue = useMemo(() => ({\n    projects, accessibleProjects, projectScope, workers: filteredWorkers, materials: filteredMaterials, expenses: filteredExpenses, dailyReports: filteredDailyReports, users, vendors, payments: filteredPayments, financialSummaries, currentUser, token, loading, error, refresh: fetchData, login, register, resendVerification, verifyUser, logout, can, addDailyReport, add, update, remove, authFetch, API_BASE, getMilestones, addMilestone, updateMilestone, removeMilestone\n  }), [projects, accessibleProjects, projectScope, filteredWorkers, filteredMaterials, filteredExpenses, filteredDailyReports, users, vendors, filteredPayments, financialSummaries, currentUser, token, loading, error, fetchData, login, register, resendVerification, verifyUser, logout, can, addDailyReport, add, update, remove, authFetch, getMilestones, addMilestone, updateMilestone, removeMilestone]);\n\n  return <AppDataContext.Provider value={contextValue}>{children}</AppDataContext.Provider>;\n}';
content = content.replace(oldProvider, newProvider);

fs.writeFileSync('src/context/AppData.js', content, 'utf8');
console.log('Update AppData.js successfully');
