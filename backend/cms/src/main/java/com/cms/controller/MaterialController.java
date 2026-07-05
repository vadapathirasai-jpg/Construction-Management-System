package com.cms.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.cms.entity.Material;
import com.cms.service.MaterialService;

@RestController
@RequestMapping("/materials")
@CrossOrigin(origins = "*")
public class MaterialController {

    @Autowired
    private MaterialService materialService;

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

    @PutMapping
    public Material updateMaterial(@RequestBody Material material) {
        return materialService.updateMaterial(material);
    }

    @DeleteMapping("/{id}")
    public void deleteMaterial(@PathVariable String id) {
        materialService.deleteMaterial(id);
    }
}