package com.cms.entity;

import java.time.LocalDate;
import jakarta.persistence.*;

@Entity
@Table(name = "attendance", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"workerId", "date"})
})
public class Attendance {

    @Id
    private String attendanceId;

    @Column(nullable = false)
    private String workerId;

    private String workerName;
    private String project;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String status;

    private String remarks;

    public Attendance() {
    }

    public Attendance(String attendanceId, String workerId, String workerName, String project, LocalDate date, String status, String remarks) {
        this.attendanceId = attendanceId;
        this.workerId = workerId;
        this.workerName = workerName;
        this.project = project;
        this.date = date;
        this.status = status;
        this.remarks = remarks;
    }

    public String getAttendanceId() {
        return attendanceId;
    }

    public void setAttendanceId(String attendanceId) {
        this.attendanceId = attendanceId;
    }

    public String getWorkerId() {
        return workerId;
    }

    public void setWorkerId(String workerId) {
        this.workerId = workerId;
    }

    public String getWorkerName() {
        return workerName;
    }

    public void setWorkerName(String workerName) {
        this.workerName = workerName;
    }

    public String getProject() {
        return project;
    }

    public void setProject(String project) {
        this.project = project;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
