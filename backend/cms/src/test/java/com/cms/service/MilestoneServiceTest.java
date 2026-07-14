package com.cms.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.cms.entity.Milestone;
import com.cms.repository.MilestoneRepository;

@ExtendWith(MockitoExtension.class)
public class MilestoneServiceTest {

    @InjectMocks
    private MilestoneService milestoneService;

    @Mock
    private MilestoneRepository milestoneRepository;

    @Test
    public void testComputeProjectProgress_NoMilestones_ReturnsNull() {
        when(milestoneRepository.findByProjectId("PRJ-1")).thenReturn(Collections.emptyList());
        assertNull(milestoneService.computeProjectProgress("PRJ-1"));
    }

    @Test
    public void testComputeProjectProgress_UnweightedAverage_ReturnsCorrectly() {
        List<Milestone> milestones = new ArrayList<>();
        milestones.add(new Milestone("M1", "PRJ-1", "Foundation", null, null, null, 100, "Completed"));
        milestones.add(new Milestone("M2", "PRJ-1", "Structure", null, null, null, 50, "In Progress"));
        milestones.add(new Milestone("M3", "PRJ-1", "Finishing", null, null, null, 0, "Not Started"));

        when(milestoneRepository.findByProjectId("PRJ-1")).thenReturn(milestones);

        Integer result = milestoneService.computeProjectProgress("PRJ-1");
        assertNotNull(result);
        assertEquals(50, result); // (100 + 50 + 0) / 3 = 50
    }

    @Test
    public void testComputeProjectProgress_WeightedAverage_ReturnsCorrectly() {
        List<Milestone> milestones = new ArrayList<>();
        milestones.add(new Milestone("M1", "PRJ-1", "Foundation", null, null, 20, 100, "Completed"));
        milestones.add(new Milestone("M2", "PRJ-1", "Structure", null, null, 40, 50, "In Progress"));
        milestones.add(new Milestone("M3", "PRJ-1", "Finishing", null, null, 40, 0, "Not Started"));

        when(milestoneRepository.findByProjectId("PRJ-1")).thenReturn(milestones);

        Integer result = milestoneService.computeProjectProgress("PRJ-1");
        assertNotNull(result);
        assertEquals(40, result); // 20% * 100 + 40% * 50 + 40% * 0 = 20 + 20 + 0 = 40
    }

    @Test
    public void testComputeProjectProgress_InvalidWeights_FallsBackToUnweighted() {
        List<Milestone> milestones = new ArrayList<>();
        milestones.add(new Milestone("M1", "PRJ-1", "Foundation", null, null, 20, 100, "Completed"));
        milestones.add(new Milestone("M2", "PRJ-1", "Structure", null, null, 50, 50, "In Progress"));
        milestones.add(new Milestone("M3", "PRJ-1", "Finishing", null, null, 40, 0, "Not Started"));

        when(milestoneRepository.findByProjectId("PRJ-1")).thenReturn(milestones);

        Integer result = milestoneService.computeProjectProgress("PRJ-1");
        assertNotNull(result);
        assertEquals(50, result); // weights sum to 110 != 100, so fallback to (100 + 50 + 0) / 3 = 50
    }
}
