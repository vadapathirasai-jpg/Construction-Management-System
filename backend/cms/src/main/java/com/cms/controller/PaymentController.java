package com.cms.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.cms.entity.Payment;
import com.cms.service.PaymentService;

@RestController
@RequestMapping("/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    public Payment createPayment(@RequestBody Payment payment) {
        return paymentService.createPayment(payment);
    }

    @GetMapping
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/{id}")
    public Payment getPaymentById(@PathVariable String id) {
        return paymentService.getPaymentById(id);
    }

    @PutMapping("/{id}/approve")
    public Payment approvePayment(@PathVariable String id) {
        return paymentService.approvePayment(id);
    }

    @PutMapping("/{id}/reject")
    public Payment rejectPayment(@PathVariable String id) {
        return paymentService.rejectPayment(id);
    }

    @PutMapping("/{id}/process")
    public Payment processPayment(@PathVariable String id, @RequestBody Payment payment) {
        return paymentService.processPayment(id, payment);
    }
}
