package com.cms.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.cms.entity.Worker;

public interface WorkerRepository extends JpaRepository<Worker, String>{
    List<Worker> findByProjectId(String projectId);
}
