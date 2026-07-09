package com.cms.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.cms.entity.Material;

public interface MaterialRepository extends JpaRepository<Material, String> {
    List<Material> findByProjectId(String projectId);
}
