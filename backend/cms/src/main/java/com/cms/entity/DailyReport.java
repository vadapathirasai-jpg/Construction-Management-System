package com.cms.entity;

import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

@Entity
@Table(name = "daily_report")

public class DailyReport {
	
	@Id
    private String id;

    private String projectId;
    private LocalDate date;
    private int present;
    private int absent;

    @JsonProperty("Labourer")
    private int labourer;

    @JsonProperty("Mason")
    private int mason;

    @JsonProperty("Electrician")
    private int electrician;

    @JsonProperty("Plumber")
    private int plumber;

    @JsonProperty("Carpenter")
    private int carpenter;

    @JsonProperty("Site Engineer")
    private int siteEngineer;

    @JsonProperty("Supervisor")
    private int supervisor;

    @JsonProperty("Machine Operator")
    private int machineOperator;

    @JsonProperty("Painter")
    private int painter;

    private int cement;
    private double sand;
    private int progress;
    private String remarks;
    private String reportedBy;
    
    
    
    
	public DailyReport() {
		
	}
	public DailyReport(String id, String projectId, LocalDate date, int present, int absent, int labourer, int mason,
			int electrician, int plumber, int carpenter, int siteEngineer, int supervisor, int machineOperator,
			int painter, int cement, double sand, int progress, String remarks, String reportedBy) {
		super();
		this.id = id;
		this.projectId = projectId;
		this.date = date;
		this.present = present;
		this.absent = absent;
		this.labourer = labourer;
		this.mason = mason;
		this.electrician = electrician;
		this.plumber = plumber;
		this.carpenter = carpenter;
		this.siteEngineer = siteEngineer;
		this.supervisor = supervisor;
		this.machineOperator = machineOperator;
		this.painter = painter;
		this.cement = cement;
		this.sand = sand;
		this.progress = progress;
		this.remarks = remarks;
		this.reportedBy = reportedBy;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getProjectId() {
		return projectId;
	}
	public void setProjectId(String projectId) {
		this.projectId = projectId;
	}
	public LocalDate getDate() {
		return date;
	}
	public void setDate(LocalDate date) {
		this.date = date;
	}
	public int getPresent() {
		return present;
	}
	public void setPresent(int present) {
		this.present = present;
	}
	public int getAbsent() {
		return absent;
	}
	public void setAbsent(int absent) {
		this.absent = absent;
	}
	public int getLabourer() {
		return labourer;
	}
	public void setLabourer(int labourer) {
		this.labourer = labourer;
	}
	public int getMason() {
		return mason;
	}
	public void setMason(int mason) {
		this.mason = mason;
	}
	public int getElectrician() {
		return electrician;
	}
	public void setElectrician(int electrician) {
		this.electrician = electrician;
	}
	public int getPlumber() {
		return plumber;
	}
	public void setPlumber(int plumber) {
		this.plumber = plumber;
	}
	public int getCarpenter() {
		return carpenter;
	}
	public void setCarpenter(int carpenter) {
		this.carpenter = carpenter;
	}
	public int getSiteEngineer() {
		return siteEngineer;
	}
	public void setSiteEngineer(int siteEngineer) {
		this.siteEngineer = siteEngineer;
	}
	public int getSupervisor() {
		return supervisor;
	}
	public void setSupervisor(int supervisor) {
		this.supervisor = supervisor;
	}
	public int getMachineOperator() {
		return machineOperator;
	}
	public void setMachineOperator(int machineOperator) {
		this.machineOperator = machineOperator;
	}
	public int getPainter() {
		return painter;
	}
	public void setPainter(int painter) {
		this.painter = painter;
	}
	public int getCement() {
		return cement;
	}
	public void setCement(int cement) {
		this.cement = cement;
	}
	public double getSand() {
		return sand;
	}
	public void setSand(double sand) {
		this.sand = sand;
	}
	public int getProgress() {
		return progress;
	}
	public void setProgress(int progress) {
		this.progress = progress;
	}
	public String getRemarks() {
		return remarks;
	}
	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}
	public String getReportedBy() {
		return reportedBy;
	}
	public void setReportedBy(String reportedBy) {
		this.reportedBy = reportedBy;
	}
    
    
}
