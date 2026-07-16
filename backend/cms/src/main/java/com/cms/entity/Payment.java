package com.cms.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.persistence.*;

@Entity
@Table(name = "payment")
public class Payment {

    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    private String expenseId;
    
    @Column(length = 500)
    private String description;
    
    private BigDecimal amount;
    
    private LocalDate dueDate;
    private LocalDate paidDate;
    
    // Statuses: PENDING_APPROVAL, APPROVED, PAID, REJECTED
    private String status;
    
    private String paymentMethod;
    private String transactionReference;
    
    private String createdBy;
    private LocalDate createdDate;
    
    private String approvedBy;
    private LocalDate approvedDate;

    public Payment() {
    }

    public Payment(String id, Project project, Vendor vendor, String expenseId, String description, BigDecimal amount,
                   LocalDate dueDate, LocalDate paidDate, String status, String paymentMethod,
                   String transactionReference, String createdBy, LocalDate createdDate, String approvedBy,
                   LocalDate approvedDate) {
        this.id = id;
        this.project = project;
        this.vendor = vendor;
        this.expenseId = expenseId;
        this.description = description;
        this.amount = amount;
        this.dueDate = dueDate;
        this.paidDate = paidDate;
        this.status = status;
        this.paymentMethod = paymentMethod;
        this.transactionReference = transactionReference;
        this.createdBy = createdBy;
        this.createdDate = createdDate;
        this.approvedBy = approvedBy;
        this.approvedDate = approvedDate;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Vendor getVendor() {
        return vendor;
    }

    public void setVendor(Vendor vendor) {
        this.vendor = vendor;
    }

    public String getExpenseId() {
        return expenseId;
    }

    public void setExpenseId(String expenseId) {
        this.expenseId = expenseId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public LocalDate getPaidDate() {
        return paidDate;
    }

    public void setPaidDate(LocalDate paidDate) {
        this.paidDate = paidDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDate getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDate createdDate) {
        this.createdDate = createdDate;
    }

    public String getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }

    public LocalDate getApprovedDate() {
        return approvedDate;
    }

    public void setApprovedDate(LocalDate approvedDate) {
        this.approvedDate = approvedDate;
    }
    
    // Helper property to return dynamic OVERDUE status
    @Transient
    public String getEffectiveStatus() {
        if ("APPROVED".equals(status) && dueDate != null && dueDate.isBefore(LocalDate.now())) {
            return "OVERDUE";
        }
        return status;
    }
}
