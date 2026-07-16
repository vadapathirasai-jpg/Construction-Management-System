package com.cms.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.cms.dto.ProjectFinancialSummary;
import com.cms.service.FinancialSummaryService;

@RestController
@RequestMapping("/financial-summary")
@CrossOrigin(origins = "*")
public class FinancialSummaryController {

    @Autowired
    private FinancialSummaryService financialSummaryService;

    @GetMapping
    public List<ProjectFinancialSummary> getDashboardSummary() {
        return financialSummaryService.getDashboardSummary();
    }
}
