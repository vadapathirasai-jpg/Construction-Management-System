package com.cms.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.persistence.*;

@Entity
@Table(name = "project")
public class Project {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String client;
    private String location;
    private BigDecimal budget;
    private String manager;
    private LocalDate start;
    private LocalDate end;
    private String status;
    private int progress;
    private String stage;
    
    public Project() {
    	
    }
    
	public Project(String id, String name, String client, String location, BigDecimal budget, String manager,
			LocalDate start, LocalDate end, String status, int progress, String stage) {
		super();
		this.id = id;
		this.name = name;
		this.client = client;
		this.location = location;
		this.budget = budget;
		this.manager = manager;
		this.start = start;
		this.end = end;
		this.status = status;
		this.progress = progress;
		this.stage = stage;
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
	public BigDecimal getBudget() {
		return budget;
	}
	public void setBudget(BigDecimal budget) {
		this.budget = budget;
	}
	public String getManager() {
		return manager;
	}
	public void setManager(String manager) {
		this.manager = manager;
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
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
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
    
}