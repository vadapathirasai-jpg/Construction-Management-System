package com.cms.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.cms.entity.DailyReport;
import com.cms.service.DailyReportService;

@RestController
@RequestMapping("/daily-reports")
@CrossOrigin(origins = "*")
public class DailyReportController {

    @Autowired
    private DailyReportService dailyReportService;

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
