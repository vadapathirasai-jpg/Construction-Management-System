package com.cms.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.cms.dto.ProjectFinancialSummary;
import com.cms.entity.Expense;
import com.cms.entity.Payment;
import com.cms.entity.Project;
import com.cms.repository.ExpenseRepository;
import com.cms.repository.PaymentRepository;
import com.cms.repository.ProjectRepository;

@Service
public class FinancialSummaryService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ProjectAssignmentService projectAssignmentService;

    public List<ProjectFinancialSummary> getDashboardSummary() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));
        
        List<Project> projects = projectRepository.findAll();
        List<ProjectFinancialSummary> summaries = new ArrayList<>();
        
        for (Project project : projects) {
            if (isAdmin || projectAssignmentService.canUserAccessProject(email, project.getId())) {
                summaries.add(calculateSummaryForProject(project));
            }
        }
        return summaries;
    }

    private ProjectFinancialSummary calculateSummaryForProject(Project project) {
        List<Expense> expenses = expenseRepository.findByProjectId(project.getId());
        List<Payment> payments = paymentRepository.findByProjectId(project.getId());

        BigDecimal budget = project.getBudget() != null ? project.getBudget() : BigDecimal.ZERO;
        
        BigDecimal totalExpenses = BigDecimal.ZERO;
        for (Expense e : expenses) {
            if (e.getAmount() != null) {
                totalExpenses = totalExpenses.add(e.getAmount());
            }
        }

        BigDecimal totalPaid = BigDecimal.ZERO;
        BigDecimal approvedUnpaid = BigDecimal.ZERO;
        BigDecimal pendingApproval = BigDecimal.ZERO;
        int overdueCount = 0;

        LocalDate today = LocalDate.now();

        for (Payment p : payments) {
            if (p.getAmount() == null) continue;

            if ("PAID".equals(p.getStatus())) {
                totalPaid = totalPaid.add(p.getAmount());
            } else if ("APPROVED".equals(p.getStatus())) {
                approvedUnpaid = approvedUnpaid.add(p.getAmount());
                if (p.getDueDate() != null && p.getDueDate().isBefore(today)) {
                    overdueCount++;
                }
            } else if ("PENDING_APPROVAL".equals(p.getStatus())) {
                pendingApproval = pendingApproval.add(p.getAmount());
            }
        }

        // Remaining Budget relies on Expenses as per user instruction.
        BigDecimal remainingBudget = budget.subtract(totalExpenses);

        return new ProjectFinancialSummary(
            project.getId(),
            project.getName(),
            budget,
            totalExpenses,
            totalPaid,
            approvedUnpaid,
            pendingApproval,
            remainingBudget,
            overdueCount
        );
    }
}
