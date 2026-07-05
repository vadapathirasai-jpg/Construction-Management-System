package com.cms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.cms.entity.Material;

public interface MaterialRepository extends JpaRepository<Material, String> {
}
