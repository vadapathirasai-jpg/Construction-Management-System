package com.cms.repository;

import com.cms.entity.MaterialPriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaterialPriceHistoryRepository extends JpaRepository<MaterialPriceHistory, String> {
    List<MaterialPriceHistory> findByMaterialIdOrderByChangedDateAsc(String materialId);
}
