package com.cms.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.persistence.*;

@Entity
@Table(name = "expense")
public class Expense {

    @Id
    private String id;

    private LocalDate date;
    private String description;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    private String category;
    private BigDecimal amount;
    private String approval;
    
    public Expense() {
		
	}
    
	public Expense(String id, LocalDate date, String description, Project project, String category, BigDecimal amount,
			String approval) {
		super();
		this.id = id;
		this.date = date;
		this.description = description;
		this.project = project;
		this.category = category;
		this.amount = amount;
		this.approval = approval;
	}

	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public LocalDate getDate() {
		return date;
	}
	public void setDate(LocalDate date) {
		this.date = date;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public Project getProject() {
		return project;
	}
	public void setProject(Project project) {
		this.project = project;
	}
	public String getCategory() {
		return category;
	}
	public void setCategory(String category) {
		this.category = category;
	}
	public BigDecimal getAmount() {
		return amount;
	}
	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}
	public String getApproval() {
		return approval;
	}
	public void setApproval(String approval) {
		this.approval = approval;
	}
    
}
