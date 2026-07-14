package com.cms.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.verification.base-url}")
    private String baseUrl;

    @Async
    public void sendVerificationOtp(String toEmail, String userName, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("24csb47@karpagamtech.ac.in", "BuildTrack");  
            helper.setTo(toEmail);
            helper.setSubject("Your BuildTrack OTP Verification Code");

            String htmlContent = "<h3>Welcome to BuildTrack, " + userName + "!</h3>"
                    + "<p>Thank you for registering. Please verify your account using the One-Time Password (OTP) below:</p>"
                    + "<div style=\"display: inline-block; padding: 15px 30px; font-size: 24px; font-weight: bold; color: #0f172a; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 5px; letter-spacing: 5px; font-family: monospace;\">" 
                    + otp + "</div>"
                    + "<br/><br/>"
                    + "<p>This code will expire in 15 minutes.</p>"
                    + "<p>If you did not request this code, please ignore this email.</p>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send verification OTP for user: {}, email: {}", userName, toEmail, e);
        }
    }

    @Async
    public void sendRoleUpdatedEmail(String toEmail, String userName, String newRole) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("24csb47@karpagamtech.ac.in", "BuildTrack");  
            helper.setTo(toEmail);
            helper.setSubject("Your BuildTrack Access Level Has Been Updated");

            String roleDescription = "";
            String normalizedRole = newRole != null ? newRole.trim().toUpperCase() : "";
            
            if ("ADMIN".equals(normalizedRole)) {
                roleDescription = "As an Admin, you have full system access to manage all users, projects, workers, materials, expenses, and system settings.";
            } else if ("PROJECT MANAGER".equals(normalizedRole)) {
                roleDescription = "As a Project Manager, you can manage assigned projects, workers, materials, and daily reports for the projects they are assigned to.";
            } else if ("SITE ENGINEER".equals(normalizedRole)) {
                roleDescription = "As a Site Engineer, you can submit and view daily site reports, attendance, and progress updates for assigned projects.";
            } else if ("ACCOUNTANT".equals(normalizedRole)) {
                roleDescription = "As an Accountant, you can view and manage expense records and financial reporting across projects.";
            } else {
                roleDescription = "Your access permissions have been updated to the " + newRole + " role. You will receive permissions associated with this role.";
            }

            String htmlContent = "<h3>Hello, " + userName + "!</h3>"
                    + "<p>An administrator has updated your BuildTrack system access role to: <strong>" + newRole + "</strong>.</p>"
                    + "<p>" + roleDescription + "</p>"
                    + "<p>Please log in to your dashboard to explore your updated workspace and access tools. If you have any questions, contact your system administrator.</p>"
                    + "<br/>"
                    + "<p>Best regards,<br/>The BuildTrack Team</p>";

            helper.setText(htmlContent, true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send role update email to user: {}, email: {}", userName, toEmail, e);
        }
    }

    @Async
    public void sendWeeklySummaryEmail(String toEmail, String projectName, String summaryHtml) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("24csb47@karpagamtech.ac.in", "BuildTrack");  
            helper.setTo(toEmail);
            helper.setSubject("Weekly AI Project Summary: " + projectName);
            helper.setText(summaryHtml, true);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Failed to send weekly summary email for project: {}, email: {}", projectName, toEmail, e);
        }
    }
}
