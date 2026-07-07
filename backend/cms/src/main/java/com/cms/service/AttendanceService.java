package com.cms.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.cms.entity.Attendance;
import com.cms.repository.AttendanceRepository;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    public Attendance saveAttendance(Attendance attendance) {
        validateAttendance(attendance);

        if (attendanceRepository.existsByWorkerIdAndDate(attendance.getWorkerId(), attendance.getDate())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "Attendance record already exists for worker " + attendance.getWorkerId() + " on " + attendance.getDate());
        }

        attendance.setAttendanceId(generateAttendanceId());
        return attendanceRepository.save(attendance);
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    public Attendance getAttendanceById(String id) {
        return attendanceRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attendance record not found"));
    }

    public Attendance updateAttendance(String id, Attendance updated) {
        Attendance existing = attendanceRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attendance record not found"));

        validateAttendance(updated);

        // Check if unique constraint is violated by changing workerId or date
        attendanceRepository.findByWorkerIdAndDate(updated.getWorkerId(), updated.getDate())
            .ifPresent(conflicting -> {
                if (!conflicting.getAttendanceId().equals(id)) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, 
                        "Attendance record already exists for worker " + updated.getWorkerId() + " on " + updated.getDate());
                }
            });

        existing.setWorkerId(updated.getWorkerId());
        existing.setWorkerName(updated.getWorkerName());
        existing.setProject(updated.getProject());
        existing.setDate(updated.getDate());
        existing.setStatus(updated.getStatus());
        existing.setRemarks(updated.getRemarks());

        return attendanceRepository.save(existing);
    }

    public void deleteAttendance(String id) {
        if (!attendanceRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Attendance record not found");
        }
        attendanceRepository.deleteById(id);
    }

    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }

    public List<Attendance> getAttendanceByProject(String project) {
        return attendanceRepository.findByProject(project);
    }

    public List<Attendance> getAttendanceByWorkerId(String workerId) {
        return attendanceRepository.findByWorkerId(workerId);
    }

    public List<Attendance> getAttendanceByStatus(String status) {
        return attendanceRepository.findByStatus(status);
    }

    public Map<String, Object> getTodayStats() {
        LocalDate today = LocalDate.now();
        long present = attendanceRepository.countByDateAndStatus(today, "Present");
        long absent = attendanceRepository.countByDateAndStatus(today, "Absent");
        long halfDay = attendanceRepository.countByDateAndStatus(today, "Half Day");
        long total = attendanceRepository.countByDate(today);

        double percentage = 0.0;
        if (total > 0) {
            double effectivePresent = present + (0.5 * halfDay);
            double calculated = (effectivePresent / total) * 100.0;
            percentage = Math.round(calculated * 100.0) / 100.0;
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("date", today);
        stats.put("totalPresent", present);
        stats.put("totalAbsent", absent);
        stats.put("totalHalfDay", halfDay);
        stats.put("totalWorkers", total);
        stats.put("attendancePercentage", percentage);

        return stats;
    }

    private void validateAttendance(Attendance attendance) {
        if (attendance.getWorkerId() == null || attendance.getWorkerId().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Worker ID cannot be empty");
        }
        if (attendance.getDate() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Date cannot be null");
        }
        if (attendance.getStatus() == null || attendance.getStatus().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status cannot be empty");
        }

        String status = attendance.getStatus().trim();
        if (!"Present".equalsIgnoreCase(status) && 
            !"Absent".equalsIgnoreCase(status) && 
            !"Half Day".equalsIgnoreCase(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Status must only be one of: Present, Absent, Half Day");
        }
        // Normalize status casing to match requirements exactly (Present, Absent, Half Day)
        if ("Present".equalsIgnoreCase(status)) {
            attendance.setStatus("Present");
        } else if ("Absent".equalsIgnoreCase(status)) {
            attendance.setStatus("Absent");
        } else if ("Half Day".equalsIgnoreCase(status)) {
            attendance.setStatus("Half Day");
        }
    }

    private String generateAttendanceId() {
        String id;
        do {
            id = "ATT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (attendanceRepository.existsById(id));
        return id;
    }
}
