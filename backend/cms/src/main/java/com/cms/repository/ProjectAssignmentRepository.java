package com.cms.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.cms.entity.ProjectAssignment;

public interface ProjectAssignmentRepository extends JpaRepository<ProjectAssignment, String> {
    List<ProjectAssignment> findByProjectId(String projectId);
    List<ProjectAssignment> findByUserId(String userId);
    boolean existsByProjectIdAndUserId(String projectId, String userId);
    void deleteByProjectIdAndUserId(String projectId, String userId);
}
