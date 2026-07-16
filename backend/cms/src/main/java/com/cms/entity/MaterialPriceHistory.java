package com.cms.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.persistence.*;

@Entity
@Table(name = "material_price_history")
public class MaterialPriceHistory {

    @Id
    private String id;

    @Column(name = "material_id", nullable = false)
    private String materialId;

    @ManyToOne
    @JoinColumn(name = "material_id", insertable = false, updatable = false)
    private Material material;

    private BigDecimal oldCost;
    private BigDecimal newCost;
    private LocalDate changedDate;

    public MaterialPriceHistory() {
    }

    public MaterialPriceHistory(String id, String materialId, BigDecimal oldCost, BigDecimal newCost, LocalDate changedDate) {
        this.id = id;
        this.materialId = materialId;
        this.oldCost = oldCost;
        this.newCost = newCost;
        this.changedDate = changedDate;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMaterialId() {
        return materialId;
    }

    public void setMaterialId(String materialId) {
        this.materialId = materialId;
    }

    public Material getMaterial() {
        return material;
    }

    public void setMaterial(Material material) {
        this.material = material;
    }

    public BigDecimal getOldCost() {
        return oldCost;
    }

    public void setOldCost(BigDecimal oldCost) {
        this.oldCost = oldCost;
    }

    public BigDecimal getNewCost() {
        return newCost;
    }

    public void setNewCost(BigDecimal newCost) {
        this.newCost = newCost;
    }

    public LocalDate getChangedDate() {
        return changedDate;
    }

    public void setChangedDate(LocalDate changedDate) {
        this.changedDate = changedDate;
    }
}
