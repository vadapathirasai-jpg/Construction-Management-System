package com.cms.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.cms.entity.Expense;
import com.cms.entity.Project;
import com.cms.repository.ExpenseRepository;
import com.cms.repository.ProjectRepository;
import com.cms.service.ProjectAssignmentService;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectAssignmentService projectAssignmentService;

    public Expense saveExpense(Expense expense) {
    	expense.setId(generateExpenseId());
        Project validatedProject = validateProject(expense.getProject());
        expense.setProject(validatedProject);

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!projectAssignmentService.canUserAccessProject(email, validatedProject.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this project.");
        }

        return expenseRepository.save(expense);
    }

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public Expense getExpenseById(String id) {
        return expenseRepository.findById(id).orElse(null);
    }

    public Expense updateExpense(Expense expense) {
        // Validate if expense exists first
        if (!expenseRepository.existsById(expense.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found");
        }
        Project validatedProject = validateProject(expense.getProject());
        expense.setProject(validatedProject);

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!projectAssignmentService.canUserAccessProject(email, validatedProject.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this project.");
        }

        return expenseRepository.save(expense);
    }

    public void deleteExpense(String id) {
        expenseRepository.deleteById(id);
    }

    private Project validateProject(Project project) {
        if (project == null || project.getId() == null || project.getId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned project not found.");
        }
        return projectRepository.findById(project.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned project not found."));
    }

    private String generateExpenseId() {
        String id;
        do {
            id = "EXP-" + UUID.randomUUID().toString().substring(0,8).toUpperCase();
        } while(expenseRepository.existsById(id));

        return id;
    }
}
