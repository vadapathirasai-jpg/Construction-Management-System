package com.cms.dto;

public class BudgetGapEstimate {
    private double currentCost;
    private double projectedFutureCost;
    private double remainingQuantityNeeded;
    private double originalEstimatedTotal;
    private double projectedEstimatedTotal;
    private double estimatedGap;

    public BudgetGapEstimate() {
    }

    public BudgetGapEstimate(double currentCost, double projectedFutureCost, double remainingQuantityNeeded,
                             double originalEstimatedTotal, double projectedEstimatedTotal, double estimatedGap) {
        this.currentCost = currentCost;
        this.projectedFutureCost = projectedFutureCost;
        this.remainingQuantityNeeded = remainingQuantityNeeded;
        this.originalEstimatedTotal = originalEstimatedTotal;
        this.projectedEstimatedTotal = projectedEstimatedTotal;
        this.estimatedGap = estimatedGap;
    }

    public double getCurrentCost() {
        return currentCost;
    }

    public void setCurrentCost(double currentCost) {
        this.currentCost = currentCost;
    }

    public double getProjectedFutureCost() {
        return projectedFutureCost;
    }

    public void setProjectedFutureCost(double projectedFutureCost) {
        this.projectedFutureCost = projectedFutureCost;
    }

    public double getRemainingQuantityNeeded() {
        return remainingQuantityNeeded;
    }

    public void setRemainingQuantityNeeded(double remainingQuantityNeeded) {
        this.remainingQuantityNeeded = remainingQuantityNeeded;
    }

    public double getOriginalEstimatedTotal() {
        return originalEstimatedTotal;
    }

    public void setOriginalEstimatedTotal(double originalEstimatedTotal) {
        this.originalEstimatedTotal = originalEstimatedTotal;
    }

    public double getProjectedEstimatedTotal() {
        return projectedEstimatedTotal;
    }

    public void setProjectedEstimatedTotal(double projectedEstimatedTotal) {
        this.projectedEstimatedTotal = projectedEstimatedTotal;
    }

    public double getEstimatedGap() {
        return estimatedGap;
    }

    public void setEstimatedGap(double estimatedGap) {
        this.estimatedGap = estimatedGap;
    }
}
