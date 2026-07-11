package com.cms.service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import com.cms.entity.DailyReport;
import com.cms.entity.Project;
import com.cms.repository.DailyReportRepository;
import com.cms.repository.ProjectRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ProjectAssistantService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private DailyReportRepository dailyReportRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String askAboutProject(String projectId, String question) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found."));

        if (question == null || question.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Question is required.");
        }

        List<DailyReport> reports = dailyReportRepository.findByProjectId(projectId);
        reports.sort(Comparator.comparing(DailyReport::getDate, Comparator.nullsLast(Comparator.naturalOrder())));

        String context = buildProjectContext(project, reports);
        Map<String, Object> requestBody = buildGeminiRequest(context, question.trim());

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            String url = UriComponentsBuilder.fromUriString(geminiApiUrl)
                    .queryParam("key", geminiApiKey)
                    .toUriString();

            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            return extractAnswer(response.getBody());
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "AI assistant is temporarily unavailable, please try again.");
        }
    }

    private String buildProjectContext(Project project, List<DailyReport> reports) {
        StringBuilder context = new StringBuilder();
        context.append("Project Information\n");
        context.append("ID: ").append(value(project.getId())).append("\n");
        context.append("Name: ").append(value(project.getName())).append("\n");
        context.append("Client: ").append(value(project.getClient())).append("\n");
        context.append("Start Date: ").append(value(project.getStart())).append("\n");
        context.append("End Date: ").append(value(project.getEnd())).append("\n");
        context.append("Budget: ").append(value(project.getBudget())).append("\n");
        context.append("Current Progress: ").append(project.getProgress()).append("%\n");
        context.append("Status: ").append(value(project.getStatus())).append("\n");
        context.append("Stage: ").append(value(project.getStage())).append("\n\n");

        context.append("Daily Reports (oldest first)\n");
        if (reports.isEmpty()) {
            context.append("No daily reports are available for this project.\n");
            return context.toString();
        }

        for (DailyReport report : reports) {
            context.append("- Date: ").append(value(report.getDate())).append("\n");
            context.append("  Progress: ").append(report.getProgress()).append("%\n");
            context.append("  Remarks: ").append(value(report.getRemarks())).append("\n");
            context.append("  Cement: ").append(report.getCement()).append("\n");
            context.append("  Sand: ").append(report.getSand()).append("\n");
        }

        return context.toString();
    }

    private Map<String, Object> buildGeminiRequest(String context, String question) {
        String systemInstruction = "You are BuildTrack's AI Project Assistant. "
                + "Only answer using the provided project data. "
                + "If the data does not contain enough information to answer, say so honestly instead of guessing. "
                + "Keep answers concise and factual, citing dates when relevant.";

        String prompt = "Project data:\n" + context + "\nQuestion:\n" + question;

        Map<String, Object> systemText = new HashMap<>();
        systemText.put("text", systemInstruction);

        Map<String, Object> systemParts = new HashMap<>();
        systemParts.put("parts", List.of(systemText));

        Map<String, Object> promptText = new HashMap<>();
        promptText.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(promptText));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("system_instruction", systemParts);
        requestBody.put("contents", List.of(content));
        return requestBody;
    }

    private String extractAnswer(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");

            if (!textNode.isTextual() || textNode.asText().isBlank()) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "AI assistant is temporarily unavailable, please try again.");
            }

            return textNode.asText().trim();
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "AI assistant is temporarily unavailable, please try again.");
        }
    }

    private String value(Object value) {
        return value == null ? "Not provided" : value.toString();
    }
}
