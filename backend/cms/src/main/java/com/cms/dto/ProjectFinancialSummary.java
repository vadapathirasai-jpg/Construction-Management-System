package com.cms.dto;

import java.math.BigDecimal;

public class ProjectFinancialSummary {
    private String projectId;
    private String projectName;
    private BigDecimal budget;
    private BigDecimal totalExpenses;
    private BigDecimal totalPaid;
    private BigDecimal approvedUnpaid;
    private BigDecimal pendingApproval;
    private BigDecimal remainingBudget;
    private int overdueCount;

    public ProjectFinancialSummary() {
    }

    public ProjectFinancialSummary(String projectId, String projectName, BigDecimal budget, BigDecimal totalExpenses,
                                   BigDecimal totalPaid, BigDecimal approvedUnpaid, BigDecimal pendingApproval,
                                   BigDecimal remainingBudget, int overdueCount) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.budget = budget;
        this.totalExpenses = totalExpenses;
        this.totalPaid = totalPaid;
        this.approvedUnpaid = approvedUnpaid;
        this.pendingApproval = pendingApproval;
        this.remainingBudget = remainingBudget;
        this.overdueCount = overdueCount;
    }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }

    public BigDecimal getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }

    public BigDecimal getTotalPaid() { return totalPaid; }
    public void setTotalPaid(BigDecimal totalPaid) { this.totalPaid = totalPaid; }

    public BigDecimal getApprovedUnpaid() { return approvedUnpaid; }
    public void setApprovedUnpaid(BigDecimal approvedUnpaid) { this.approvedUnpaid = approvedUnpaid; }

    public BigDecimal getPendingApproval() { return pendingApproval; }
    public void setPendingApproval(BigDecimal pendingApproval) { this.pendingApproval = pendingApproval; }

    public BigDecimal getRemainingBudget() { return remainingBudget; }
    public void setRemainingBudget(BigDecimal remainingBudget) { this.remainingBudget = remainingBudget; }

    public int getOverdueCount() { return overdueCount; }
    public void setOverdueCount(int overdueCount) { this.overdueCount = overdueCount; }
}
