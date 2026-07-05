package com.cms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cms.entity.DailyReport;

public interface DailyReportRepository extends JpaRepository<DailyReport, String> {
}
