package com.cms.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import com.cms.entity.Attendance;
import com.cms.service.AttendanceService;

@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping
    public Attendance createAttendance(@RequestBody Attendance attendance) {
        return attendanceService.saveAttendance(attendance);
    }

    @GetMapping
    public List<Attendance> getAllAttendance() {
        return attendanceService.getAllAttendance();
    }

    @GetMapping("/{id}")
    public Attendance getAttendanceById(@PathVariable String id) {
        return attendanceService.getAttendanceById(id);
    }

    @PutMapping("/{id}")
    public Attendance updateAttendance(@PathVariable String id, @RequestBody Attendance attendance) {
        return attendanceService.updateAttendance(id, attendance);
    }

    @DeleteMapping("/{id}")
    public void deleteAttendance(@PathVariable String id) {
        attendanceService.deleteAttendance(id);
    }

    @GetMapping("/date/{date}")
    public List<Attendance> getAttendanceByDate(@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return attendanceService.getAttendanceByDate(date);
    }

    @GetMapping("/project/{project}")
    public List<Attendance> getAttendanceByProject(@PathVariable String project) {
        return attendanceService.getAttendanceByProject(project);
    }

    @GetMapping("/worker/{workerId}")
    public List<Attendance> getAttendanceByWorkerId(@PathVariable String workerId) {
        return attendanceService.getAttendanceByWorkerId(workerId);
    }

    @GetMapping("/status/{status}")
    public List<Attendance> getAttendanceByStatus(@PathVariable String status) {
        return attendanceService.getAttendanceByStatus(status);
    }

    @GetMapping("/stats/today")
    public Map<String, Object> getTodayStats() {
        return attendanceService.getTodayStats();
    }
}
