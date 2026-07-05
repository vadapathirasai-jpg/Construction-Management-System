package com.cms.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.cms.entity.DailyReport;
import com.cms.repository.DailyReportRepository;

@Service
public class DailyReportService {

    @Autowired
    private DailyReportRepository dailyReportRepository;

    public DailyReport saveDailyReport(DailyReport report) {
        return dailyReportRepository.save(report);
    }

    public List<DailyReport> getAllDailyReports() {
        return dailyReportRepository.findAll();
    }

    public DailyReport getDailyReportById(String id) {
        return dailyReportRepository.findById(id).orElse(null);
    }

    public DailyReport updateDailyReport(DailyReport report) {
        return dailyReportRepository.save(report);
    }

    public void deleteDailyReport(String id) {
        dailyReportRepository.deleteById(id);
    }
}
