package com.cms.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;

import com.cms.dto.ProjectGanttSummary;
import com.cms.entity.Project;
import com.cms.entity.User;
import com.cms.service.ProjectAssistantService;
import com.cms.service.ProjectService;
import com.cms.service.WeeklySummaryScheduler;

@RestController
@RequestMapping("/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ProjectAssistantService projectAssistantService;

    @Autowired
    private WeeklySummaryScheduler weeklySummaryScheduler;

    @GetMapping("/test-weekly-summary")
    public org.springframework.http.ResponseEntity<?> testWeeklySummary() {
        weeklySummaryScheduler.runWeeklySummaryJob();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Weekly summary job triggered successfully!");
        return org.springframework.http.ResponseEntity.ok(response);
    }

    @PostMapping
    public Project saveProject(@RequestBody Project project) {
        return projectService.saveProject(project);
    }

    @GetMapping
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }
    
    @GetMapping("/managers")
    public List<User> getAvailableProjectManagers() {
        return projectService.getAvailableProjectManagers();
    }

    @GetMapping("/{id}")
    public Project getProjectById(@PathVariable String id) {
        return projectService.getProjectById(id);
    }

    @PutMapping("/{id}")
    public Project updateProject(@PathVariable String id, @RequestBody Project project) {
        return projectService.updateProject(id, project);
    }

    @DeleteMapping("/{id}")
    public void deleteProject(@PathVariable String id) {
        projectService.deleteProject(id);
    }

    @PostMapping("/{projectId}/assistant/ask")
    public org.springframework.http.ResponseEntity<?> askAssistant(@PathVariable String projectId, @RequestBody Map<String, String> body) {
        try {
            Map<String, String> response = new HashMap<>();
            response.put("answer", projectAssistantService.askAboutProject(projectId, body.get("question")));
            return org.springframework.http.ResponseEntity.ok(response);
        } catch (org.springframework.web.server.ResponseStatusException ex) {
            Map<String, String> response = new HashMap<>();
            response.put("error", ex.getReason());
            return org.springframework.http.ResponseEntity.status(ex.getStatusCode()).body(response);
        } catch (Exception ex) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "AI assistant is temporarily unavailable, please try again.");
            return org.springframework.http.ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/gantt-summary")
    public List<ProjectGanttSummary> getGanttSummary() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String role = "";
        if (auth != null) {
            role = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .findFirst()
                    .orElse("");
        }
        return projectService.getGanttSummaries(role);
    }
}
