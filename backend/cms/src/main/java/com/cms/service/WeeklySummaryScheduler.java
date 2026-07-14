package com.cms.service;

import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import com.cms.entity.Project;
import com.cms.entity.User;
import com.cms.repository.ProjectRepository;
import com.cms.repository.UserRepository;

@Service
public class WeeklySummaryScheduler {

    private static final Logger log = LoggerFactory.getLogger(WeeklySummaryScheduler.class);

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectAssistantService projectAssistantService;

    @Autowired
    private EmailService emailService;

    // Run every Monday at 9:00 AM
    @Scheduled(cron = "0 0 9 * * MON")
    public void runWeeklySummaryJob() {
        log.info("Starting scheduled weekly project summary job...");
        List<Project> projects = projectRepository.findAll();
        List<User> admins = userRepository.findByRole("ADMIN");

        for (Project project : projects) {
            try {
                if (!"Active".equalsIgnoreCase(project.getStatus())) {
                    continue;
                }

                log.info("Generating weekly summary for project: {}", project.getName());
                String question = "Please provide a concise weekly progress summary for this project, highlighting key completed tasks, material usage, and any potential risks or updates from the daily reports.";
                String summaryText = projectAssistantService.askAboutProject(project.getId(), question);

                String htmlContent = "<h3>Weekly AI Progress Summary</h3>"
                        + "<h4>Project: " + project.getName() + " (ID: " + project.getId() + ")</h4>"
                        + "<p>Location: " + project.getLocation() + " | Client: " + project.getClient() + "</p>"
                        + "<div style=\"background-color: #f8fafc; border-left: 4px solid #f5821f; padding: 15px; margin: 15px 0; font-family: sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b;\">"
                        + summaryText.replace("\n", "<br/>")
                        + "</div>"
                        + "<p>Please visit the dashboard to review complete details.</p>"
                        + "<br/>"
                        + "<p>Best regards,<br/>The BuildTrack Team</p>";

                List<String> recipients = new ArrayList<>();
                if (project.getManager() != null && project.getManager().getEmail() != null) {
                    recipients.add(project.getManager().getEmail());
                }
                for (User admin : admins) {
                    if ("Active".equalsIgnoreCase(admin.getStatus()) && admin.getEmail() != null && !recipients.contains(admin.getEmail())) {
                        recipients.add(admin.getEmail());
                    }
                }

                for (String email : recipients) {
                    emailService.sendWeeklySummaryEmail(email, project.getName(), htmlContent);
                }
                log.info("Successfully sent weekly summary for project: {} to {} recipients", project.getName(), recipients.size());

            } catch (Exception e) {
                log.error("Error generating weekly summary for project: {}", project.getId(), e);
            }
        }
    }
}
