package com.cms.dto;

import java.time.LocalDate;
import java.util.List;

public class ProjectGanttSummary {
    private String id;
    private String name;
    private String client;
    private String location;
    private LocalDate start;
    private LocalDate end;
    private int progress;
    private String stage;
    private String status;

    private Integer reportedProgress;
    private String progressSource;
    private Double budget;
    private Double spent;
    private Integer budgetUsedPercent;
    private Boolean isBudgetOverrunRisk;

    private String materialsStatus;
    private Boolean isMaterialRisk;
    private List<String> lowStockMaterials;
    private String budgetPredictionMessage;

    public ProjectGanttSummary() {}

    public ProjectGanttSummary(String id, String name, String client, String location, LocalDate start, LocalDate end,
                               int progress, String stage, String status, Integer reportedProgress, String progressSource,
                               Double budget, Double spent, Integer budgetUsedPercent, Boolean isBudgetOverrunRisk,
                               String materialsStatus, Boolean isMaterialRisk, List<String> lowStockMaterials,
                               String budgetPredictionMessage) {
        this.id = id;
        this.name = name;
        this.client = client;
        this.location = location;
        this.start = start;
        this.end = end;
        this.progress = progress;
        this.stage = stage;
        this.status = status;
        this.reportedProgress = reportedProgress;
        this.progressSource = progressSource;
        this.budget = budget;
        this.spent = spent;
        this.budgetUsedPercent = budgetUsedPercent;
        this.isBudgetOverrunRisk = isBudgetOverrunRisk;
        this.materialsStatus = materialsStatus;
        this.isMaterialRisk = isMaterialRisk;
        this.lowStockMaterials = lowStockMaterials;
        this.budgetPredictionMessage = budgetPredictionMessage;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getClient() {
        return client;
    }

    public void setClient(String client) {
        this.client = client;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDate getStart() {
        return start;
    }

    public void setStart(LocalDate start) {
        this.start = start;
    }

    public LocalDate getEnd() {
        return end;
    }

    public void setEnd(LocalDate end) {
        this.end = end;
    }

    public int getProgress() {
        return progress;
    }

    public void setProgress(int progress) {
        this.progress = progress;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getReportedProgress() {
        return reportedProgress;
    }

    public void setReportedProgress(Integer reportedProgress) {
        this.reportedProgress = reportedProgress;
    }

    public String getProgressSource() {
        return progressSource;
    }

    public void setProgressSource(String progressSource) {
        this.progressSource = progressSource;
    }

    public Double getBudget() {
        return budget;
    }

    public void setBudget(Double budget) {
        this.budget = budget;
    }

    public Double getSpent() {
        return spent;
    }

    public void setSpent(Double spent) {
        this.spent = spent;
    }

    public Integer getBudgetUsedPercent() {
        return budgetUsedPercent;
    }

    public void setBudgetUsedPercent(Integer budgetUsedPercent) {
        this.budgetUsedPercent = budgetUsedPercent;
    }

    public Boolean getIsBudgetOverrunRisk() {
        return isBudgetOverrunRisk;
    }

    public void setIsBudgetOverrunRisk(Boolean isBudgetOverrunRisk) {
        this.isBudgetOverrunRisk = isBudgetOverrunRisk;
    }

    public String getMaterialsStatus() {
        return materialsStatus;
    }

    public void setMaterialsStatus(String materialsStatus) {
        this.materialsStatus = materialsStatus;
    }

    public Boolean getIsMaterialRisk() {
        return isMaterialRisk;
    }

    public void setIsMaterialRisk(Boolean isMaterialRisk) {
        this.isMaterialRisk = isMaterialRisk;
    }

    public List<String> getLowStockMaterials() {
        return lowStockMaterials;
    }

    public void setLowStockMaterials(List<String> lowStockMaterials) {
        this.lowStockMaterials = lowStockMaterials;
    }

    public String getBudgetPredictionMessage() {
        return budgetPredictionMessage;
    }

    public void setBudgetPredictionMessage(String budgetPredictionMessage) {
        this.budgetPredictionMessage = budgetPredictionMessage;
    }
}
