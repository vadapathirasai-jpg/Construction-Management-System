package com.cms.entity;

import java.math.BigDecimal;
import jakarta.persistence.*;

@Entity
@Table(name = "worker")
public class Worker {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String role;
    private String phone;
    private BigDecimal wage;
    private String project;
    private String status;
    
    public Worker() {
    	
    }
    
	public Worker(String id, String name, String role, String phone, BigDecimal wage, String project, String status) {
		super();
		this.id = id;
		this.name = name;
		this.role = role;
		this.phone = phone;
		this.wage = wage;
		this.project = project;
		this.status = status;
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
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
	}
	public BigDecimal getWage() {
		return wage;
	}
	public void setWage(BigDecimal wage) {
		this.wage = wage;
	}
	public String getProject() {
		return project;
	}
	public void setProject(String project) {
		this.project = project;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
    
    
}