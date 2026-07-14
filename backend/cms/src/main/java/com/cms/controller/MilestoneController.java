package com.cms.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.cms.entity.Milestone;
import com.cms.service.MilestoneService;

@RestController
@CrossOrigin(origins = "*")
public class MilestoneController {

    @Autowired
    private MilestoneService milestoneService;

    @GetMapping("/projects/{projectId}/milestones")
    public List<Milestone> getMilestonesForProject(@PathVariable String projectId) {
        return milestoneService.getMilestonesForProject(projectId);
    }

    @PostMapping("/projects/{projectId}/milestones")
    public Milestone createMilestone(@PathVariable String projectId, @RequestBody Milestone milestone) {
        milestone.setProjectId(projectId);
        return milestoneService.saveMilestone(milestone);
    }

    @PutMapping("/milestones/{id}")
    public Milestone updateMilestone(@PathVariable String id, @RequestBody Milestone milestone) {
        return milestoneService.updateMilestone(id, milestone);
    }

    @DeleteMapping("/milestones/{id}")
    public void deleteMilestone(@PathVariable String id) {
        milestoneService.deleteMilestone(id);
    }
}
