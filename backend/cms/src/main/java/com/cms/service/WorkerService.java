package com.cms.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.cms.entity.Project;
import com.cms.entity.Worker;
import com.cms.repository.ProjectRepository;
import com.cms.repository.WorkerRepository;
import com.cms.service.ProjectAssignmentService;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class WorkerService {

    @Autowired
    private WorkerRepository workerRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectAssignmentService projectAssignmentService;

    public Worker saveWorker(Worker worker) {
    	worker.setId(generateWorkerId());
        Project validatedProject = validateProject(worker.getProject());
        worker.setProject(validatedProject);

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!projectAssignmentService.canUserAccessProject(email, validatedProject.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this project.");
        }

        return workerRepository.save(worker);
    }

    public List<Worker> getAllWorkers() {
        return workerRepository.findAll();
    }

    public Worker getWorkerById(String id) {
        return workerRepository.findById(id).orElse(null);
    }

    public Worker updateWorker(String id, Worker newWorker) {

        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));

        worker.setName(newWorker.getName());
        worker.setRole(newWorker.getRole());
        worker.setPhone(newWorker.getPhone());
        worker.setWage(newWorker.getWage());

        Project validatedProject = validateProject(newWorker.getProject());

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!projectAssignmentService.canUserAccessProject(email, validatedProject.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this project.");
        }

        worker.setProject(validatedProject);
        worker.setStatus(newWorker.getStatus());

        return workerRepository.save(worker);
    }

    public void deleteWorker(String id) {
        Worker existing = workerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Worker not found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (existing.getProject() != null && !projectAssignmentService.canUserAccessProject(email, existing.getProject().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this project.");
        }

        workerRepository.delete(existing);
    }

    private Project validateProject(Project project) {
        if (project == null || project.getId() == null || project.getId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned project not found.");
        }
        return projectRepository.findById(project.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned project not found."));
    }

    private String generateWorkerId() {
        String id;

        do {
            id = "WRK-" + UUID.randomUUID()
                             .toString()
                             .substring(0, 8)
                             .toUpperCase();

        } while (workerRepository.existsById(id));

        return id;
    }
}
