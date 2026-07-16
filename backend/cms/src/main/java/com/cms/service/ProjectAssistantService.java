package com.cms.service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import com.cms.entity.DailyReport;
import com.cms.entity.Project;
import com.cms.entity.Expense;
import com.cms.entity.Material;
import com.cms.entity.Milestone;
import com.cms.repository.DailyReportRepository;
import com.cms.repository.ProjectRepository;
import com.cms.repository.ExpenseRepository;
import com.cms.repository.MaterialRepository;
import com.cms.repository.MilestoneRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ProjectAssistantService {

    private static final Logger log = LoggerFactory.getLogger(ProjectAssistantService.class);

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private DailyReportRepository dailyReportRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private MilestoneRepository milestoneRepository;

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

        return invokeGemini(requestBody);
    }

    public String polishDailyReportRemarks(String roughNotes) {
        if (roughNotes == null || roughNotes.isBlank()) {
            return roughNotes;
        }

        String systemInstruction = "The following are rough, informal notes from a construction site engineer's daily report. "
                + "Rewrite them as a clear, professional, concise report remark in 1-3 sentences. "
                + "Do not invent any details not mentioned in the notes. "
                + "If the notes are empty or nonsensical, return them unchanged rather than fabricating content.";

        Map<String, Object> systemText = new HashMap<>();
        systemText.put("text", systemInstruction);

        Map<String, Object> systemParts = new HashMap<>();
        systemParts.put("parts", List.of(systemText));

        Map<String, Object> promptText = new HashMap<>();
        promptText.put("text", roughNotes.trim());

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(promptText));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("systemInstruction", systemParts);
        requestBody.put("contents", List.of(content));

        return invokeGemini(requestBody);
    }

    public String explainPriceTrend(String materialName, Integer annualTrendPercent) {
        if (annualTrendPercent == null) {
            return "Not enough price history yet to estimate a trend for " + materialName + ".";
        }

        String systemInstruction = "Explain in one or two plain sentences what this material price trend means for a construction project's budget planning. Be factual and concise. Do not invent numbers not provided.";

        Map<String, Object> systemText = new HashMap<>();
        systemText.put("text", systemInstruction);

        Map<String, Object> systemParts = new HashMap<>();
        systemParts.put("parts", List.of(systemText));

        String prompt = "Material: " + materialName + "\nAnnual Price Trend: " + annualTrendPercent + "%";
        
        Map<String, Object> promptText = new HashMap<>();
        promptText.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(promptText));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("systemInstruction", systemParts);
        requestBody.put("contents", List.of(content));

        return invokeGemini(requestBody);
    }

    private String invokeGemini(Map<String, Object> requestBody) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "AI assistant is not configured. Set the GEMINI_API_KEY environment variable on the backend.");
        }

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
        } catch (HttpStatusCodeException ex) {
            log.error("Gemini API call failed with status {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            String detail = switch (ex.getStatusCode().value()) {
                case 400 -> "AI request was rejected (bad request). Check the backend logs for details.";
                case 401, 403 -> "AI assistant rejected the API key (unauthorized). Check GEMINI_API_KEY is valid and has access to the Generative Language API.";
                case 404 -> "AI model not found for this API key/endpoint. Check the configured Gemini model name.";
                case 429 -> "AI assistant hit a rate limit or quota. Please try again shortly.";
                default -> "AI assistant is temporarily unavailable, please try again.";
            };
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, detail);
        } catch (Exception ex) {
            log.error("Unexpected error calling Gemini API", ex);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "AI assistant is temporarily unavailable, please try again.");
        }
    }

    private String buildProjectContext(Project project, List<DailyReport> reports) {
        StringBuilder context = new StringBuilder();
        context.append("PROJECT INFORMATION:\n");
        context.append("ID: ").append(value(project.getId())).append("\n");
        context.append("Name: ").append(value(project.getName())).append("\n");
        context.append("Client: ").append(value(project.getClient())).append("\n");
        context.append("Start Date: ").append(value(project.getStart())).append("\n");
        context.append("End Date: ").append(value(project.getEnd())).append("\n");
        context.append("Budget: ").append(value(project.getBudget())).append("\n");
        context.append("Current Progress: ").append(project.getProgress()).append("%\n");
        context.append("Status: ").append(value(project.getStatus())).append("\n");
        context.append("Stage: ").append(value(project.getStage())).append("\n\n");

        // EXPENSES:
        List<Expense> expenses = expenseRepository.findByProjectId(project.getId());
        double totalApprovedExpenses = expenses.stream()
                .filter(e -> "Approved".equalsIgnoreCase(e.getApproval()))
                .mapToDouble(e -> e.getAmount() != null ? e.getAmount().doubleValue() : 0.0)
                .sum();
        context.append("EXPENSES:\n");
        context.append("Total Approved Expenses Spent: ").append(totalApprovedExpenses).append("\n");
        if (expenses.isEmpty()) {
            context.append("No expenses recorded.\n\n");
        } else {
            for (Expense expense : expenses) {
                context.append("- Date: ").append(value(expense.getDate()))
                        .append(" | Description: ").append(value(expense.getDescription()))
                        .append(" | Category: ").append(value(expense.getCategory()))
                        .append(" | Amount: ").append(value(expense.getAmount()))
                        .append(" | Status: ").append(value(expense.getApproval())).append("\n");
            }
            context.append("\n");
        }

        // MATERIALS:
        List<Material> materials = materialRepository.findByProjectId(project.getId());
        context.append("MATERIALS:\n");
        if (materials.isEmpty()) {
            context.append("No materials recorded.\n\n");
        } else {
            for (Material material : materials) {
                String name = value(material.getName());
                double quantity = material.getQuantity();
                String status = value(material.getStatus());
                
                context.append("- Name: ").append(name)
                        .append(" | Quantity: ").append(quantity)
                        .append(" | Unit: ").append(value(material.getUnit()))
                        .append(" | Status: ").append(status);
                
                if ("Low Stock".equalsIgnoreCase(status) || "Out of Stock".equalsIgnoreCase(status)) {
                    context.append(" [WARNING: ").append(status.toUpperCase()).append("]");
                }
                context.append("\n");
            }
            context.append("\n");
        }

        // MILESTONES:
        List<Milestone> milestones = milestoneRepository.findByProjectId(project.getId());
        context.append("MILESTONES:\n");
        if (milestones.isEmpty()) {
            context.append("No milestones recorded.\n\n");
        } else {
            for (Milestone milestone : milestones) {
                context.append("- Name: ").append(value(milestone.getName()))
                        .append(" | Planned Start: ").append(value(milestone.getPlannedStart()))
                        .append(" | Planned End: ").append(value(milestone.getPlannedEnd()))
                        .append(" | Weight: ").append(milestone.getWeightPercent())
                        .append(" | Progress: ").append(milestone.getPercentComplete()).append("%")
                        .append(" | Status: ").append(value(milestone.getStatus())).append("\n");
            }
            context.append("\n");
        }

        // DAILY REPORTS (oldest first, capped to latest 15 for token efficiency):
        context.append("DAILY REPORTS (latest 15 reports, oldest to newest):\n");
        if (reports.isEmpty()) {
            context.append("No daily reports are available for this project.\n\n");
        } else {
            List<DailyReport> displayReports = reports;
            if (reports.size() > 15) {
                displayReports = reports.subList(reports.size() - 15, reports.size());
            }
            for (DailyReport report : displayReports) {
                context.append("- Date: ").append(value(report.getDate())).append("\n");
                context.append("  Progress: ").append(report.getProgress()).append("%\n");
                context.append("  Remarks: ").append(value(report.getRemarks())).append("\n");
                context.append("  Cement: ").append(report.getCement()).append(" bags\n");
                context.append("  Sand: ").append(report.getSand()).append(" units\n");
            }
            context.append("\n");
        }

        return context.toString();
    }

    private Map<String, Object> buildGeminiRequest(String context, String question) {
        String systemInstruction = "You are BuildTrack's AI Project Assistant. "
                + "You can answer questions about daily activity, budget/expenses, material stock, and project milestones/phases. "
                + "Only answer using the provided project data. "
                + "If the data does not contain enough information to answer, say so honestly instead of guessing. "
                + "Keep answers concise and factual, citing dates, costs, stock levels, or milestone progress when relevant.";

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
        requestBody.put("systemInstruction", systemParts);
        requestBody.put("contents", List.of(content));
        return requestBody;
    }

    private String extractAnswer(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");

            if (!textNode.isTextual() || textNode.asText().isBlank()) {
                log.error("Gemini response had no usable text. Raw response: {}", responseBody);
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "AI assistant is temporarily unavailable, please try again.");
            }

            return textNode.asText().trim();
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Failed to parse Gemini response. Raw response: {}", responseBody, ex);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "AI assistant is temporarily unavailable, please try again.");
        }
    }

    private String value(Object value) {
        return value == null ? "Not provided" : value.toString();
    }
}