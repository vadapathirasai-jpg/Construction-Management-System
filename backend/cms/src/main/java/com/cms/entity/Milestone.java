package com.cms.entity;

import java.time.LocalDate;
import jakarta.persistence.*;

@Entity
@Table(name = "milestone")
public class Milestone {

    @Id
    private String id;

    @Column(nullable = false)
    private String projectId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "projectId", referencedColumnName = "id", insertable = false, updatable = false)
    private Project project;

    @Column(nullable = false)
    private String name;

    private LocalDate plannedStart;
    private LocalDate plannedEnd;

    private Integer weightPercent;

    @Column(nullable = false)
    private Integer percentComplete = 0;

    @Column(nullable = false)
    private String status = "Not Started";

    public Milestone() {
    }

    public Milestone(String id, String projectId, String name, LocalDate plannedStart, LocalDate plannedEnd, Integer weightPercent, Integer percentComplete, String status) {
        this.id = id;
        this.projectId = projectId;
        this.name = name;
        this.plannedStart = plannedStart;
        this.plannedEnd = plannedEnd;
        this.weightPercent = weightPercent;
        this.percentComplete = percentComplete != null ? percentComplete : 0;
        this.status = status != null ? status : "Not Started";
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

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getPlannedStart() {
        return plannedStart;
    }

    public void setPlannedStart(LocalDate plannedStart) {
        this.plannedStart = plannedStart;
    }

    public LocalDate getPlannedEnd() {
        return plannedEnd;
    }

    public void setPlannedEnd(LocalDate plannedEnd) {
        this.plannedEnd = plannedEnd;
    }

    public Integer getWeightPercent() {
        return weightPercent;
    }

    public void setWeightPercent(Integer weightPercent) {
        this.weightPercent = weightPercent;
    }

    public Integer getPercentComplete() {
        return percentComplete;
    }

    public void setPercentComplete(Integer percentComplete) {
        this.percentComplete = percentComplete;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
