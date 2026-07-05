package com.cms.entity;

import java.math.BigDecimal;
import jakarta.persistence.*;

@Entity
@Table(name = "material")
public class Material {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String category;
    private double quantity;
    private String unit;
    private String supplier;
    private BigDecimal cost;
    private String status;
    
    public Material() {
    	
    }
    
	public Material(String id, String name, String category, double quantity, String unit, String supplier,
			BigDecimal cost, String status) {
		super();
		this.id = id;
		this.name = name;
		this.category = category;
		this.quantity = quantity;
		this.unit = unit;
		this.supplier = supplier;
		this.cost = cost;
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
	public String getCategory() {
		return category;
	}
	public void setCategory(String category) {
		this.category = category;
	}
	public double getQuantity() {
		return quantity;
	}
	public void setQuantity(double quantity) {
		this.quantity = quantity;
	}
	public String getUnit() {
		return unit;
	}
	public void setUnit(String unit) {
		this.unit = unit;
	}
	public String getSupplier() {
		return supplier;
	}
	public void setSupplier(String supplier) {
		this.supplier = supplier;
	}
	public BigDecimal getCost() {
		return cost;
	}
	public void setCost(BigDecimal cost) {
		this.cost = cost;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
    
    
}
