package com.cms.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.cms.entity.Project;
import com.cms.repository.ProjectRepository;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    public Project saveProject(Project project) {
        normalizeCompletedProject(project);
        return projectRepository.save(project);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProjectById(String id) {
        return projectRepository.findById(id).orElse(null);
    }

    public Project updateProject(String id, Project newProject) {
        Project prev = projectRepository.findById(id).orElseThrow(() -> new RuntimeException("Project Not found"));
        
        prev.setName(newProject.getName());
        prev.setClient(newProject.getClient());
        prev.setLocation(newProject.getLocation());
        prev.setBudget(newProject.getBudget());
        prev.setManager(newProject.getManager());
        prev.setStart(newProject.getStart());
        prev.setEnd(newProject.getEnd());
        prev.setStatus(newProject.getStatus());
        prev.setProgress(newProject.getProgress());
        prev.setStage(newProject.getStage());
        normalizeCompletedProject(prev);
        
        return projectRepository.save(prev);
    }

    public void deleteProject(String id) {
        Project project = projectRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        if (!"Completed".equals(project.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only completed projects can be deleted");
        }
        projectRepository.delete(project);
    }

    private void normalizeCompletedProject(Project project) {
        if ("Completed".equals(project.getStatus())) {
            project.setProgress(100);
            project.setStage("Completed");
        }
    }
}
