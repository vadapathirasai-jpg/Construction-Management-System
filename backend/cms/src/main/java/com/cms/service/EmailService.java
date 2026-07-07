package com.cms.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.verification.base-url}")
    private String baseUrl;

    public void sendVerificationEmail(String toEmail, String userName, String token) throws MessagingException {
        String verificationUrl = baseUrl + "?token=" + token;

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(toEmail);
        helper.setSubject("Verify Your BuildTrack Account");

        String htmlContent = "<h3>Welcome to BuildTrack, " + userName + "!</h3>"
                + "<p>Thank you for registering. Please verify your account by clicking the link below:</p>"
                + "<p><a href=\"" + verificationUrl + "\" style=\"display: inline-block; padding: 10px 20px; color: white; background-color: #0284c7; text-decoration: none; border-radius: 5px; font-weight: bold;\">Verify Account</a></p>"
                + "<br/>"
                + "<p>If the button doesn't work, copy and paste this link into your browser:</p>"
                + "<p>" + verificationUrl + "</p>"
                + "<p>Note: This link will expire in 24 hours.</p>";

        helper.setText(htmlContent, true);
        mailSender.send(message);
    }
}
