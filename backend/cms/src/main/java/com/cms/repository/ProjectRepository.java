package com.cms.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cms.entity.Project;

public interface ProjectRepository extends JpaRepository<Project, String>{

}
