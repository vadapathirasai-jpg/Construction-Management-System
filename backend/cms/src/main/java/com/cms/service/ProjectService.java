package com.cms.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.cms.entity.Project;
import com.cms.entity.User;
import com.cms.repository.ProjectRepository;
import com.cms.repository.UserRepository;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private UserRepository userRepository;

    public Project saveProject(Project project) {
    	project.setId(generateProjectId());
        project.setManager(validateProjectManager(project.getManager()));
        normalizeCompletedProject(project);
        return projectRepository.save(project);
    }

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    public Project getProjectById(String id) {
        return projectRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not exit"));
    }

    public Project updateProject(String id, Project newProject) {
        Project prev = projectRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project Not found"));
        
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
        
        return projectRepository.save(prev);
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
}
