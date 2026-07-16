package com.cms.service;

import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.cms.entity.Material;
import com.cms.entity.Project;
import com.cms.entity.MaterialPriceHistory;
import com.cms.dto.BudgetGapEstimate;
import com.cms.repository.MaterialRepository;
import com.cms.repository.ProjectRepository;
import com.cms.repository.MaterialPriceHistoryRepository;
import com.cms.service.ProjectAssignmentService;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class MaterialService {

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private MaterialPriceHistoryRepository materialPriceHistoryRepository;

    @Autowired
    private ProjectAssignmentService projectAssignmentService;

    public Material saveMaterial(Material material){
        material.setId(generateMaterialId());
        Project validatedProject = validateProject(material.getProject());
        material.setProject(validatedProject);

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!projectAssignmentService.canUserAccessProject(email, validatedProject.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this project.");
        }

        normalizeMaterial(material);
        
        MaterialPriceHistory history = new MaterialPriceHistory();
        history.setId(generateMaterialPriceHistoryId());
        history.setMaterialId(material.getId());
        history.setOldCost(null);
        history.setNewCost(material.getCost());
        history.setChangedDate(LocalDate.now());
        materialPriceHistoryRepository.save(history);

        return materialRepository.save(material);
    }

    public List<Material> getAllMaterials() {
        return materialRepository.findAll();
    }

    public Material getMaterialById(String id) {
        return materialRepository.findById(id).orElse(null);
    }

    public Material updateMaterial(String id, Material updated) {

        Material material = materialRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Material not found"));

        BigDecimal oldCost = material.getCost();
        BigDecimal newCost = updated.getCost();

        material.setName(updated.getName());
        material.setCategory(updated.getCategory());
        material.setQuantity(updated.getQuantity());
        material.setUnit(updated.getUnit());
        material.setSupplier(updated.getSupplier());
        material.setCost(newCost);

        Project validatedProject = validateProject(updated.getProject());

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!projectAssignmentService.canUserAccessProject(email, validatedProject.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this project.");
        }

        if (newCost != null && (oldCost == null || newCost.compareTo(oldCost) != 0)) {
            MaterialPriceHistory history = new MaterialPriceHistory();
            history.setId(generateMaterialPriceHistoryId());
            history.setMaterialId(material.getId());
            history.setOldCost(oldCost);
            history.setNewCost(newCost);
            history.setChangedDate(LocalDate.now());
            materialPriceHistoryRepository.save(history);
        }

        material.setProject(validatedProject);
        normalizeMaterial(material);

        return materialRepository.save(material);
    }

    public void deleteMaterial(String id) {
        materialRepository.deleteById(id);
    }
    
    private Project validateProject(Project project) {
        if (project == null || project.getId() == null || project.getId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned project not found.");
        }
        return projectRepository.findById(project.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assigned project not found."));
    }

    private void normalizeMaterial(Material material){
        if(material.getQuantity()==0){
            material.setStatus("Out of Stock");
        }
        else if(material.getQuantity()<20){
            material.setStatus("Low Stock");
        }
        else{
            material.setStatus("Available");
        }
    }
    
    private String generateMaterialId() {
        String id;
        do {
            id = "MAT-" +UUID.randomUUID().toString().substring(0,8).toUpperCase();
        } 
        while(materialRepository.existsById(id));

        return id;
    }

    private String generateMaterialPriceHistoryId() {
        String id;
        do {
            id = "MPH-" +UUID.randomUUID().toString().substring(0,8).toUpperCase();
        } 
        while(materialPriceHistoryRepository.existsById(id));

        return id;
    }

    public Integer computeAnnualPriceTrendPercent(String materialId) {
        List<MaterialPriceHistory> history = materialPriceHistoryRepository.findByMaterialIdOrderByChangedDateAsc(materialId);
        if (history == null || history.size() < 2) {
            return null;
        }

        MaterialPriceHistory first = history.get(0);
        MaterialPriceHistory last = history.get(history.size() - 1);

        if (first.getNewCost() == null || last.getNewCost() == null || first.getNewCost().compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }

        long daysBetween = ChronoUnit.DAYS.between(first.getChangedDate(), last.getChangedDate());
        if (daysBetween <= 0) {
            return null;
        }

        double percentageChange = (last.getNewCost().doubleValue() - first.getNewCost().doubleValue()) / first.getNewCost().doubleValue();
        double annualRate = percentageChange * (365.25 / daysBetween);

        return (int) Math.round(annualRate * 100);
    }

    public BudgetGapEstimate estimateInflationGap(String materialId, double remainingQuantityNeeded, LocalDate projectEndDate) {
        Integer annualTrendPercent = computeAnnualPriceTrendPercent(materialId);
        if (annualTrendPercent == null) {
            return null;
        }

        Material material = materialRepository.findById(materialId).orElse(null);
        if (material == null || material.getCost() == null) {
            return null;
        }

        double currentCost = material.getCost().doubleValue();

        long daysToProjectEnd = ChronoUnit.DAYS.between(LocalDate.now(), projectEndDate);
        if (daysToProjectEnd < 0) {
            daysToProjectEnd = 0;
        }

        double projectedIncreasePercent = (annualTrendPercent / 100.0) * (daysToProjectEnd / 365.25);
        double projectedFutureCost = currentCost * (1 + projectedIncreasePercent);

        double originalEstimatedTotal = currentCost * remainingQuantityNeeded;
        double projectedEstimatedTotal = projectedFutureCost * remainingQuantityNeeded;
        double estimatedGap = projectedEstimatedTotal - originalEstimatedTotal;

        return new BudgetGapEstimate(currentCost, projectedFutureCost, remainingQuantityNeeded, originalEstimatedTotal, projectedEstimatedTotal, estimatedGap);
    }
    
}
