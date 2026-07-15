package com.cms.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.cms.entity.DailyReport;
import com.cms.service.DailyReportService;
import com.cms.service.ProjectAssistantService;

@RestController
@RequestMapping("/daily-reports")
@CrossOrigin(origins = "*")
public class DailyReportController {

    @Autowired
    private DailyReportService dailyReportService;

    @Autowired
    private ProjectAssistantService projectAssistantService;

    @PostMapping("/polish-remarks")
    public java.util.Map<String, String> polishRemarks(@RequestBody java.util.Map<String, String> request) {
        String notes = request.get("notes");
        if (notes == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, "Notes field is required.");
        }
        String polished = projectAssistantService.polishDailyReportRemarks(notes);
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("polished", polished);
        return response;
    }

    @PostMapping
    public DailyReport saveDailyReport(@RequestBody DailyReport report) {
        return dailyReportService.saveDailyReport(report);
    }

    @GetMapping
    public List<DailyReport> getAllDailyReports() {
        return dailyReportService.getAllDailyReports();
    }

    @GetMapping("/{id}")
    public DailyReport getDailyReportById(@PathVariable String id) {
        return dailyReportService.getDailyReportById(id);
    }

    @PutMapping
    public DailyReport updateDailyReport(@RequestBody DailyReport report) {
        return dailyReportService.updateDailyReport(report);
    }

    @DeleteMapping("/{id}")
    public void deleteDailyReport(@PathVariable String id) {
        dailyReportService.deleteDailyReport(id);
    }
}
