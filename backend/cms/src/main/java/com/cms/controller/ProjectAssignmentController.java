package com.cms.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.server.ResponseStatusException;
import com.cms.entity.ProjectAssignment;
import com.cms.entity.User;
import com.cms.service.ProjectAssignmentService;

@RestController
@RequestMapping("/projects/{projectId}/assignments")
@CrossOrigin(origins = "*")
public class ProjectAssignmentController {

    @Autowired
    private ProjectAssignmentService projectAssignmentService;

    @PostMapping
    public ResponseEntity<ProjectAssignment> assignUserToProject(
            @PathVariable String projectId,
            @RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        if (userId == null || userId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required.");
        }
        ProjectAssignment assignment = projectAssignmentService.assignUserToProject(projectId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(assignment);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeAssignment(
            @PathVariable String projectId,
            @PathVariable String userId) {
        projectAssignmentService.removeAssignment(projectId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public List<User> getAssignedUsersForProject(@PathVariable String projectId) {
        return projectAssignmentService.getAssignedUsersForProject(projectId);
    }
}
