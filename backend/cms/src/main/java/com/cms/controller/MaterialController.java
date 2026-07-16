package com.cms.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.cms.entity.Material;
import com.cms.service.MaterialService;
import com.cms.service.ProjectAssistantService;
import java.util.Map;
import java.util.HashMap;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/materials")
@CrossOrigin(origins = "*")
public class MaterialController {

    @Autowired
    private MaterialService materialService;

    @Autowired
    private ProjectAssistantService projectAssistantService;

    @PostMapping
    public Material saveMaterial(@RequestBody Material material) {
        return materialService.saveMaterial(material);
    }

    @GetMapping
    public List<Material> getAllMaterials() {
        return materialService.getAllMaterials();
    }

    @GetMapping("/{id}")
    public Material getMaterialById(@PathVariable String id) {
        return materialService.getMaterialById(id);
    }

    @PutMapping("/{id}")
    public Material updateMaterial(@PathVariable String id,@RequestBody Material material){

        return materialService.updateMaterial(id, material);

    }

    @DeleteMapping("/{id}")
    public void deleteMaterial(@PathVariable String id) {
        materialService.deleteMaterial(id);
    }

    @GetMapping("/{id}/price-trend")
    public Map<String, Object> getPriceTrend(@PathVariable String id) {
        Integer trend = materialService.computeAnnualPriceTrendPercent(id);
        Map<String, Object> response = new HashMap<>();
        response.put("annualTrendPercent", trend);
        return response;
    }

    @GetMapping("/{id}/price-trend-explanation")
    public Map<String, Object> getPriceTrendExplanation(@PathVariable String id) {
        Material material = materialService.getMaterialById(id);
        if (material == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Material not found");
        }
        Integer trend = materialService.computeAnnualPriceTrendPercent(id);
        String explanation = projectAssistantService.explainPriceTrend(material.getName(), trend);
        Map<String, Object> response = new HashMap<>();
        response.put("explanation", explanation);
        return response;
    }
}