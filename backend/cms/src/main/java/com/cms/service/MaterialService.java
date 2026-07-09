package com.cms.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.cms.entity.Material;
import com.cms.entity.Project;
import com.cms.repository.MaterialRepository;
import com.cms.repository.ProjectRepository;
import com.cms.service.ProjectAssignmentService;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class MaterialService {

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private ProjectRepository projectRepository;

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

        material.setName(updated.getName());
        material.setCategory(updated.getCategory());
        material.setQuantity(updated.getQuantity());
        material.setUnit(updated.getUnit());
        material.setSupplier(updated.getSupplier());
        material.setCost(updated.getCost());

        Project validatedProject = validateProject(updated.getProject());

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!projectAssignmentService.canUserAccessProject(email, validatedProject.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not assigned to this project.");
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
    
}
