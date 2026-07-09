package com.cms.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.cms.entity.Expense;

public interface ExpenseRepository extends JpaRepository<Expense, String> {
    List<Expense> findByProjectId(String projectId);
}
