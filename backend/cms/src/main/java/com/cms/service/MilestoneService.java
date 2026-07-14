package com.cms.service;

import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.cms.entity.Milestone;
import com.cms.repository.MilestoneRepository;

@Service
public class MilestoneService {

    @Autowired
    private MilestoneRepository milestoneRepository;

    @Autowired
    private ProjectAssignmentService projectAssignmentService;

    public List<Milestone> getMilestonesForProject(String projectId) {
        return milestoneRepository.findByProjectId(projectId);
    }

    public Milestone saveMilestone(Milestone milestone) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!projectAssignmentService.canUserAccessProject(email, milestone.getProjectId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this project.");
        }

        milestone.setId(generateMilestoneId());
        if (milestone.getPercentComplete() == null) {
            milestone.setPercentComplete(0);
        }
        if (milestone.getStatus() == null) {
            milestone.setStatus("Not Started");
        }
        return milestoneRepository.save(milestone);
    }

    public Milestone updateMilestone(String id, Milestone newMilestone) {
        Milestone existing = milestoneRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Milestone not found."));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!projectAssignmentService.canUserAccessProject(email, existing.getProjectId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this project.");
        }

        existing.setName(newMilestone.getName());
        existing.setPlannedStart(newMilestone.getPlannedStart());
        existing.setPlannedEnd(newMilestone.getPlannedEnd());
        existing.setWeightPercent(newMilestone.getWeightPercent());
        existing.setPercentComplete(newMilestone.getPercentComplete() != null ? newMilestone.getPercentComplete() : 0);
        existing.setStatus(newMilestone.getStatus() != null ? newMilestone.getStatus() : "Not Started");

        return milestoneRepository.save(existing);
    }

    public void deleteMilestone(String id) {
        Milestone existing = milestoneRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Milestone not found."));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!projectAssignmentService.canUserAccessProject(email, existing.getProjectId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this project.");
        }

        milestoneRepository.delete(existing);
    }

    public Integer computeProjectProgress(String projectId) {
        List<Milestone> milestones = milestoneRepository.findByProjectId(projectId);
        if (milestones == null || milestones.isEmpty()) {
            return null;
        }

        boolean useWeights = true;
        int weightSum = 0;
        for (Milestone m : milestones) {
            if (m.getWeightPercent() == null || m.getWeightPercent() < 0) {
                useWeights = false;
                break;
            }
            weightSum += m.getWeightPercent();
        }

        if (useWeights && Math.abs(weightSum - 100) > 1) {
            useWeights = false;
        }

        double calculatedProgress = 0.0;
        if (useWeights && weightSum > 0) {
            double weightedSum = 0.0;
            for (Milestone m : milestones) {
                int pct = m.getPercentComplete() != null ? m.getPercentComplete() : 0;
                weightedSum += pct * ((double) m.getWeightPercent() / weightSum);
            }
            calculatedProgress = weightedSum;
        } else {
            double sum = 0.0;
            for (Milestone m : milestones) {
                sum += m.getPercentComplete() != null ? m.getPercentComplete() : 0;
            }
            calculatedProgress = sum / milestones.size();
        }

        return (int) Math.round(calculatedProgress);
    }

    private String generateMilestoneId() {
        String id;
        do {
            id = "MLS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (milestoneRepository.existsById(id));
        return id;
    }
}
