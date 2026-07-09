package com.cms.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.cms.entity.DailyReport;

public interface DailyReportRepository extends JpaRepository<DailyReport, String> {
    List<DailyReport> findByProjectId(String projectId);
}
