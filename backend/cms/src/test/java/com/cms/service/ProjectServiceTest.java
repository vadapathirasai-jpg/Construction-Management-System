package com.cms.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.cms.dto.ProjectGanttSummary;
import com.cms.entity.Project;
import com.cms.entity.Expense;
import com.cms.entity.Material;
import com.cms.repository.ProjectRepository;
import com.cms.repository.ExpenseRepository;
import com.cms.repository.MaterialRepository;
import com.cms.repository.DailyReportRepository;

@ExtendWith(MockitoExtension.class)
public class ProjectServiceTest {

    @InjectMocks
    private ProjectService projectService;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private MaterialRepository materialRepository;

    @Mock
    private DailyReportRepository dailyReportRepository;

    @Mock
    private MilestoneService milestoneService;

    @org.junit.jupiter.api.BeforeEach
    public void setUp() {
        org.mockito.Mockito.lenient().when(milestoneService.computeProjectProgress(org.mockito.ArgumentMatchers.anyString())).thenReturn(null);
    }

    @Test
    public void testGetGanttSummaries_NoExpensesMaterialsReports() {
        Project project = new Project();
        project.setId("PRJ-123");
        project.setName("Test Project");
        project.setBudget(new BigDecimal("10000"));
        project.setStart(LocalDate.now());
        project.setEnd(LocalDate.now().plusDays(30));
        project.setProgress(20);
        project.setStatus("Active");

        when(projectRepository.findAll()).thenReturn(Collections.singletonList(project));
        when(dailyReportRepository.findByProjectId("PRJ-123")).thenReturn(Collections.emptyList());
        when(expenseRepository.findByProjectId("PRJ-123")).thenReturn(Collections.emptyList());
        when(materialRepository.findByProjectId("PRJ-123")).thenReturn(Collections.emptyList());

        List<ProjectGanttSummary> result = projectService.getGanttSummaries("ADMIN");

        assertEquals(1, result.size());
        ProjectGanttSummary summary = result.get(0);
        assertEquals("PRJ-123", summary.getId());
        assertEquals("Test Project", summary.getName());
        assertEquals(20, summary.getReportedProgress());
        assertEquals("Project Profile", summary.getProgressSource());
        assertEquals(10000.0, summary.getBudget());
        assertEquals(0.0, summary.getSpent());
        assertEquals(0, summary.getBudgetUsedPercent());
        assertFalse(summary.getIsBudgetOverrunRisk());
        assertEquals("OK", summary.getMaterialsStatus());
        assertFalse(summary.getIsMaterialRisk());
    }

    @Test
    public void testGetGanttSummaries_BudgetOverrunRisk() {
        Project project = new Project();
        project.setId("PRJ-123");
        project.setName("Test Project");
        project.setBudget(new BigDecimal("10000"));
        project.setStart(LocalDate.now());
        project.setEnd(LocalDate.now().plusDays(30));
        project.setProgress(20);
        project.setStatus("Active");

        Expense expense = new Expense();
        expense.setId("EXP-1");
        expense.setAmount(new BigDecimal("6000"));
        expense.setApproval("Approved");

        when(projectRepository.findAll()).thenReturn(Collections.singletonList(project));
        when(dailyReportRepository.findByProjectId("PRJ-123")).thenReturn(Collections.emptyList());
        when(expenseRepository.findByProjectId("PRJ-123")).thenReturn(Collections.singletonList(expense));
        when(materialRepository.findByProjectId("PRJ-123")).thenReturn(Collections.emptyList());

        List<ProjectGanttSummary> result = projectService.getGanttSummaries("ADMIN");

        assertEquals(1, result.size());
        ProjectGanttSummary summary = result.get(0);
        assertEquals(6000.0, summary.getSpent());
        assertEquals(60, summary.getBudgetUsedPercent());
        assertTrue(summary.getIsBudgetOverrunRisk());
    }

    @Test
    public void testGetGanttSummaries_SiteEngineerScrubbing() {
        Project project = new Project();
        project.setId("PRJ-123");
        project.setName("Test Project");
        project.setBudget(new BigDecimal("10000"));
        project.setStart(LocalDate.now());
        project.setEnd(LocalDate.now().plusDays(30));
        project.setProgress(20);
        project.setStatus("Active");

        Expense expense = new Expense();
        expense.setId("EXP-1");
        expense.setAmount(new BigDecimal("6000"));
        expense.setApproval("Approved");

        when(projectRepository.findAll()).thenReturn(Collections.singletonList(project));
        when(dailyReportRepository.findByProjectId("PRJ-123")).thenReturn(Collections.emptyList());
        when(expenseRepository.findByProjectId("PRJ-123")).thenReturn(Collections.singletonList(expense));
        when(materialRepository.findByProjectId("PRJ-123")).thenReturn(Collections.emptyList());

        List<ProjectGanttSummary> result = projectService.getGanttSummaries("SITE ENGINEER");

        assertEquals(1, result.size());
        ProjectGanttSummary summary = result.get(0);
        assertNull(summary.getBudget());
        assertNull(summary.getSpent());
        assertNull(summary.getBudgetUsedPercent());
        assertNull(summary.getIsBudgetOverrunRisk());
    }

    @Test
    public void testGetGanttSummaries_WithMilestoneProgress() {
        Project project = new Project();
        project.setId("PRJ-123");
        project.setName("Test Project");
        project.setBudget(new BigDecimal("10000"));
        project.setStart(LocalDate.now());
        project.setEnd(LocalDate.now().plusDays(30));
        project.setProgress(20);
        project.setStatus("Active");

        when(milestoneService.computeProjectProgress("PRJ-123")).thenReturn(65);
        when(projectRepository.findAll()).thenReturn(Collections.singletonList(project));
        when(dailyReportRepository.findByProjectId("PRJ-123")).thenReturn(Collections.emptyList());
        when(expenseRepository.findByProjectId("PRJ-123")).thenReturn(Collections.emptyList());
        when(materialRepository.findByProjectId("PRJ-123")).thenReturn(Collections.emptyList());

        List<ProjectGanttSummary> result = projectService.getGanttSummaries("ADMIN");

        assertEquals(1, result.size());
        ProjectGanttSummary summary = result.get(0);
        assertEquals(65, summary.getReportedProgress());
        assertEquals("Milestone Breakdown", summary.getProgressSource());
    }
}
