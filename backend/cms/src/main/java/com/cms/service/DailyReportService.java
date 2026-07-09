package com.cms.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.context.SecurityContextHolder;
import com.cms.entity.DailyReport;
import com.cms.repository.DailyReportRepository;
import com.cms.repository.ProjectRepository;

@Service
public class DailyReportService {

    @Autowired
    private DailyReportRepository dailyReportRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectAssignmentService projectAssignmentService;

    public DailyReport saveDailyReport(DailyReport report) {
        String projectId = report.getProjectId();
        if (projectId == null || projectId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project ID is required.");
        }
        if (!projectRepository.existsById(projectId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found.");
        }
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!projectAssignmentService.canUserAccessProject(email, projectId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this project.");
        }
        return dailyReportRepository.save(report);
    }

    public List<DailyReport> getAllDailyReports() {
        return dailyReportRepository.findAll();
    }

    public DailyReport getDailyReportById(String id) {
        return dailyReportRepository.findById(id).orElse(null);
    }

    public DailyReport updateDailyReport(DailyReport report) {
        String projectId = report.getProjectId();
        if (projectId == null || projectId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project ID is required.");
        }
        if (!projectRepository.existsById(projectId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found.");
        }
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!projectAssignmentService.canUserAccessProject(email, projectId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this project.");
        }
        return dailyReportRepository.save(report);
    }

    public void deleteDailyReport(String id) {
        dailyReportRepository.deleteById(id);
    }
}
