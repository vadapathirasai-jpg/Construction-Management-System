package com.cms.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.cms.entity.Payment;
import com.cms.entity.Project;
import com.cms.entity.Vendor;
import com.cms.repository.PaymentRepository;
import com.cms.repository.ProjectRepository;
import com.cms.repository.VendorRepository;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private ProjectAssignmentService projectAssignmentService;

    public Payment createPayment(Payment payment) {
        Project validatedProject = validateProject(payment.getProject());
        Vendor validatedVendor = validateVendor(payment.getVendor());

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!projectAssignmentService.canUserAccessProject(email, validatedProject.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this project.");
        }

        payment.setId(generatePaymentId());
        payment.setProject(validatedProject);
        payment.setVendor(validatedVendor);
        payment.setStatus("PENDING_APPROVAL");
        payment.setCreatedBy(email);
        payment.setCreatedDate(LocalDate.now());

        return paymentRepository.save(payment);
    }

    public List<Payment> getAllPayments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));
        
        List<Payment> payments = paymentRepository.findAll();
        
        if (isAdmin) {
            return payments;
        }
        
        return payments.stream()
                .filter(p -> projectAssignmentService.canUserAccessProject(email, p.getProject().getId()))
                .collect(Collectors.toList());
    }

    public Payment getPaymentById(String id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!projectAssignmentService.canUserAccessProject(email, payment.getProject().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this project.");
        }
        
        return payment;
    }

    public Payment approvePayment(String id) {
        Payment payment = getPaymentById(id);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean canApprove = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_PROJECT_MANAGER") ||
                               a.getAuthority().equals("ADMIN") || a.getAuthority().equals("PROJECT MANAGER"));
        
        if (!canApprove) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Project Manager or Admin can approve payments.");
        }
        
        if (!"PENDING_APPROVAL".equals(payment.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment is not pending approval.");
        }
        
        payment.setStatus("APPROVED");
        payment.setApprovedBy(auth.getName());
        payment.setApprovedDate(LocalDate.now());
        
        return paymentRepository.save(payment);
    }
    
    public Payment rejectPayment(String id) {
        Payment payment = getPaymentById(id);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean canReject = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_PROJECT_MANAGER") ||
                               a.getAuthority().equals("ADMIN") || a.getAuthority().equals("PROJECT MANAGER"));
        
        if (!canReject) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Project Manager or Admin can reject payments.");
        }
        
        if (!"PENDING_APPROVAL".equals(payment.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment is not pending approval.");
        }
        
        payment.setStatus("REJECTED");
        return paymentRepository.save(payment);
    }

    public Payment processPayment(String id, Payment paymentDetails) {
        Payment payment = getPaymentById(id);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean canProcess = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_ACCOUNTANT") ||
                               a.getAuthority().equals("ADMIN") || a.getAuthority().equals("ACCOUNTANT"));
        
        if (!canProcess) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only Accountant or Admin can process payments.");
        }
        
        if (!"APPROVED".equals(payment.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only approved payments can be processed.");
        }
        
        if (paymentDetails.getPaymentMethod() == null || paymentDetails.getPaymentMethod().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment method is required.");
        }
        
        payment.setStatus("PAID");
        payment.setPaymentMethod(paymentDetails.getPaymentMethod());
        payment.setTransactionReference(paymentDetails.getTransactionReference());
        payment.setPaidDate(paymentDetails.getPaidDate() != null ? paymentDetails.getPaidDate() : LocalDate.now());
        
        return paymentRepository.save(payment);
    }

    private Project validateProject(Project project) {
        if (project == null || project.getId() == null || project.getId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project not provided.");
        }
        return projectRepository.findById(project.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project not found."));
    }

    private Vendor validateVendor(Vendor vendor) {
        if (vendor == null || vendor.getId() == null || vendor.getId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vendor not provided.");
        }
        return vendorRepository.findById(vendor.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vendor not found."));
    }

    private String generatePaymentId() {
        String id;
        do {
            id = "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (paymentRepository.existsById(id));
        return id;
    }
}
