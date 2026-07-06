package com.cms.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.cms.entity.Material;
import com.cms.repository.MaterialRepository;

@Service
public class MaterialService {

    @Autowired
    private MaterialRepository materialRepository;

    public Material saveMaterial(Material material){

        material.setId(generateMaterialId());

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
                .orElseThrow(() ->
                        new RuntimeException("Material not found"));

        material.setName(updated.getName());
        material.setCategory(updated.getCategory());
        material.setQuantity(updated.getQuantity());
        material.setUnit(updated.getUnit());
        material.setSupplier(updated.getSupplier());
        material.setCost(updated.getCost());

        normalizeMaterial(material);

        return materialRepository.save(material);
    }

    public void deleteMaterial(String id) {
        materialRepository.deleteById(id);
    }
    
    private void normalizeMaterial(
            Material material){
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
