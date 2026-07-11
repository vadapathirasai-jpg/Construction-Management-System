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

@RestController
@RequestMapping("/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private ProjectAssistantService projectAssistantService;

    @PostMapping
    public Project saveProject(@RequestBody Project project) {
        System.out.println(project.getName());
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
    public Map<String, String> askAssistant(@PathVariable String projectId, @RequestBody Map<String, String> body) {
        Map<String, String> response = new HashMap<>();
        response.put("answer", projectAssistantService.askAboutProject(projectId, body.get("question")));
        return response;
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
