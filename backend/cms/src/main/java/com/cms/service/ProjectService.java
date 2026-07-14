package com.cms.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.cms.dto.ProjectGanttSummary;
import com.cms.entity.Project;
import com.cms.entity.User;
import com.cms.entity.Expense;
import com.cms.entity.Material;
import com.cms.entity.DailyReport;
import com.cms.repository.ProjectRepository;
import com.cms.repository.UserRepository;
import com.cms.repository.ExpenseRepository;
import com.cms.repository.MaterialRepository;
import com.cms.repository.DailyReportRepository;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private DailyReportRepository dailyReportRepository;

    @Autowired
    private ProjectAssignmentService projectAssignmentService;

    @Autowired
    private MilestoneService milestoneService;

    public Project saveProject(Project project) {
    	project.setId(generateProjectId());
        project.setManager(validateProjectManager(project.getManager()));
        normalizeCompletedProject(project);
        Project saved = projectRepository.save(project);
        if (saved.getManager() != null) {
            projectAssignmentService.assignManagerImplicitly(saved.getId(), saved.getManager().getId());
        }
        return saved;
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProjectById(String id) {
        return projectRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not exit"));
    }

    public Project updateProject(String id, Project newProject) {
        Project prev = projectRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project Not found"));
        
        String oldManagerId = prev.getManager() != null ? prev.getManager().getId() : null;
        
        prev.setName(newProject.getName());
        prev.setClient(newProject.getClient());
        prev.setLocation(newProject.getLocation());
        prev.setBudget(newProject.getBudget());
        if (newProject.getManager() != null) {
            prev.setManager(validateProjectManager(newProject.getManager()));
        }
        prev.setStart(newProject.getStart());
        prev.setEnd(newProject.getEnd());
        prev.setStatus(newProject.getStatus());
        prev.setProgress(newProject.getProgress());
        prev.setStage(newProject.getStage());
        normalizeCompletedProject(prev);
        
        Project saved = projectRepository.save(prev);
        
        String newManagerId = saved.getManager() != null ? saved.getManager().getId() : null;
        if (newManagerId != null && !newManagerId.equals(oldManagerId)) {
            projectAssignmentService.assignManagerImplicitly(saved.getId(), newManagerId);
        }
        
        return saved;
    }
    
    public List<User> getAvailableProjectManagers() {
        return userRepository.findByRole("PROJECT MANAGER");
    }

    public void deleteProject(String id) {
        Project project = projectRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        if (!"Completed".equals(project.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only completed projects can be deleted");
        }
        projectRepository.delete(project);
    }

    private void normalizeCompletedProject(Project project) {
        if ("Completed".equals(project.getStatus()) || project.getProgress() == 100) {
            project.setStatus("Completed");
            project.setProgress(100);
            project.setStage("Completed");
        }
    }
    
    private User validateProjectManager(User assignedManager) {
        if (assignedManager == null || assignedManager.getId() == null || assignedManager.getId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned manager not found.");
        }
        
        User user = userRepository.findById(assignedManager.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned manager not found."));
        
        if (!"PROJECT MANAGER".equals(user.getRole())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned user is not a Project Manager.");
        }
        
        return user;
    }
    
    private String generateProjectId() {
    	String id;
    	do {
    		id = "PRJ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    	}while(projectRepository.existsById(id));
    	return id;
    }

    public List<ProjectGanttSummary> getGanttSummaries(String role) {
        List<Project> allProjects = projectRepository.findAll();
        List<ProjectGanttSummary> summaries = new ArrayList<>();

        for (Project project : allProjects) {
            List<DailyReport> reports = dailyReportRepository.findByProjectId(project.getId());
            DailyReport latestReport = reports.stream()
                    .filter(r -> r.getDate() != null)
                    .max(Comparator.comparing(DailyReport::getDate))
                    .orElse(null);

            Integer reportedProgress;
            String progressSource;

            if ("Completed".equalsIgnoreCase(project.getStatus())) {
                reportedProgress = 100;
                progressSource = "Project Profile";
            } else {
                Integer milestoneProgress = milestoneService.computeProjectProgress(project.getId());
                if (milestoneProgress != null) {
                    reportedProgress = milestoneProgress;
                    progressSource = "Milestone Breakdown";
                } else if (latestReport != null) {
                    reportedProgress = latestReport.getProgress();
                    progressSource = "Daily Report (" + latestReport.getDate() + ")";
                } else {
                    reportedProgress = project.getProgress();
                    progressSource = "Project Profile";
                }
            }

            List<Expense> expenses = expenseRepository.findByProjectId(project.getId());
            double spentVal = expenses.stream()
                    .filter(e -> "Approved".equalsIgnoreCase(e.getApproval()))
                    .mapToDouble(e -> e.getAmount() != null ? e.getAmount().doubleValue() : 0.0)
                    .sum();

            Double budgetVal = project.getBudget() != null ? project.getBudget().doubleValue() : null;
            Integer budgetUsedPercent = null;
            Boolean isBudgetOverrunRisk = null;
            String budgetPredictionMessage = null;

            if (budgetVal != null && budgetVal > 0) {
                budgetUsedPercent = (int) Math.round((spentVal / budgetVal) * 100);
                isBudgetOverrunRisk = budgetUsedPercent > (reportedProgress + 15);

                if ("SITE ENGINEER".equalsIgnoreCase(role)) {
                    budgetPredictionMessage = null;
                } else if (spentVal >= budgetVal) {
                    budgetPredictionMessage = "Budget already exceeded!";
                } else {
                    java.time.LocalDate startDate = project.getStart();
                    java.time.LocalDate today = java.time.LocalDate.now();
                    if (startDate != null) {
                        long daysElapsed = java.time.temporal.ChronoUnit.DAYS.between(startDate, today);
                        if (daysElapsed <= 0) {
                            daysElapsed = 1;
                        }
                        double spendRatePerDay = spentVal / daysElapsed;
                        if (spendRatePerDay > 0) {
                            double remainingBudget = budgetVal - spentVal;
                            long daysToExhaust = (long) Math.ceil(remainingBudget / spendRatePerDay);
                            java.time.LocalDate exceedDate = today.plusDays(daysToExhaust);
                            budgetPredictionMessage = "At this rate, budget will be exceeded by " + exceedDate.toString();
                        } else {
                            budgetPredictionMessage = "Spend rate is too low to project overrun.";
                        }
                    }
                }
            }

            List<Material> materials = materialRepository.findByProjectId(project.getId());
            List<String> lowStockList = materials.stream()
                    .filter(m -> "Low Stock".equalsIgnoreCase(m.getStatus()) || "Out of Stock".equalsIgnoreCase(m.getStatus()))
                    .map(Material::getName)
                    .collect(Collectors.toList());

            Boolean isMaterialRisk = !lowStockList.isEmpty();
            String materialsStatus = "OK";
            if (materials.stream().anyMatch(m -> "Out of Stock".equalsIgnoreCase(m.getStatus()))) {
                materialsStatus = "Out of Stock";
            } else if (isMaterialRisk) {
                materialsStatus = "Low Stock";
            }

            Double finalBudget = budgetVal;
            Double finalSpent = spentVal;
            if ("SITE ENGINEER".equalsIgnoreCase(role)) {
                finalSpent = null;
                budgetUsedPercent = null;
                isBudgetOverrunRisk = null;
                finalBudget = null;
                budgetPredictionMessage = null;
            }

            ProjectGanttSummary summary = new ProjectGanttSummary(
                    project.getId(),
                    project.getName(),
                    project.getClient(),
                    project.getLocation(),
                    project.getStart(),
                    project.getEnd(),
                    project.getProgress(),
                    project.getStage(),
                    project.getStatus(),
                    reportedProgress,
                    progressSource,
                    finalBudget,
                    finalSpent,
                    budgetUsedPercent,
                    isBudgetOverrunRisk,
                    materialsStatus,
                    isMaterialRisk,
                    lowStockList,
                    budgetPredictionMessage
            );
            summaries.add(summary);
        }

        return summaries;
    }
}
