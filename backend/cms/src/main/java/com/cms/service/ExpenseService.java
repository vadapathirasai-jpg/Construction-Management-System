package com.cms.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.cms.entity.Expense;
import com.cms.repository.ExpenseRepository;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    public Expense saveExpense(Expense expense) {
    	expense.setId(generateExpenseId());
        return expenseRepository.save(expense);
    }

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public Expense getExpenseById(String id) {
        return expenseRepository.findById(id).orElse(null);
    }

    public Expense updateExpense(Expense expense) {
        return expenseRepository.save(expense);
    }

    public void deleteExpense(String id) {
        expenseRepository.deleteById(id);
    }
    private String generateExpenseId() {
        String id;
        do {
            id = "EXP-" + UUID.randomUUID().toString().substring(0,8).toUpperCase();
        } while(expenseRepository.existsById(id));

        return id;
    }
}
