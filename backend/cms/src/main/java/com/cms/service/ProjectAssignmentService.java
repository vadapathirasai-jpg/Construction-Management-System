package com.cms.service;

import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.cms.entity.Project;
import com.cms.entity.ProjectAssignment;
import com.cms.entity.User;
import com.cms.repository.ProjectAssignmentRepository;
import com.cms.repository.ProjectRepository;
import com.cms.repository.UserRepository;

@Service
public class ProjectAssignmentService {

    @Autowired
    private ProjectAssignmentRepository projectAssignmentRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    public ProjectAssignment assignUserToProject(String projectId, String userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found."));

        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        if (!canUserAccessProject(email, projectId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this project.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));

        String role = user.getRole();
        if (!"PROJECT MANAGER".equals(role) && !"SITE ENGINEER".equals(role) && !"ACCOUNTANT".equals(role)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User role is not eligible for assignment.");
        }

        if (projectAssignmentRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User is already assigned to this project.");
        }

        String id = generateAssignmentId();
        ProjectAssignment assignment = new ProjectAssignment(id, project, user);
        return projectAssignmentRepository.save(assignment);
    }

    @Transactional
    public void removeAssignment(String projectId, String userId) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        if (!canUserAccessProject(email, projectId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this project.");
        }

        if (!projectAssignmentRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found.");
        }
        projectAssignmentRepository.deleteByProjectIdAndUserId(projectId, userId);
    }

    public List<User> getAssignedUsersForProject(String projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found.");
        }
        return projectAssignmentRepository.findByProjectId(projectId).stream()
                .map(ProjectAssignment::getUser)
                .toList();
    }

    public List<Project> getProjectsForUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found.");
        }
        return projectAssignmentRepository.findByUserId(userId).stream()
                .map(ProjectAssignment::getProject)
                .toList();
    }

    public boolean canUserAccessProject(String userEmail, String projectId) {
        User user = userRepository.findByEmail(userEmail).orElse(null);
        if (user == null) {
            return false;
        }
        if ("ADMIN".equals(user.getRole())) {
            return true;
        }
        if (!projectAssignmentRepository.existsByProjectIdAndUserId(projectId, user.getId())) {
            return false;
        }
        String role = user.getRole();
        return "PROJECT MANAGER".equals(role) || "SITE ENGINEER".equals(role) || "ACCOUNTANT".equals(role);
    }

    public void assignManagerImplicitly(String projectId, String userId) {
        if (projectId == null || userId == null) {
            return;
        }
        if (!projectAssignmentRepository.existsByProjectIdAndUserId(projectId, userId)) {
            Project project = projectRepository.findById(projectId).orElse(null);
            User user = userRepository.findById(userId).orElse(null);
            if (project != null && user != null) {
                String id = generateAssignmentId();
                ProjectAssignment assignment = new ProjectAssignment(id, project, user);
                projectAssignmentRepository.save(assignment);
            }
        }
    }

    private String generateAssignmentId() {
        String id;
        do {
            id = "PA-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (projectAssignmentRepository.existsById(id));
        return id;
    }
}
