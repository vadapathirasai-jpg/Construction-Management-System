package com.cms.repository;

import java.util.List;
import com.cms.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    List<Payment> findByProjectId(String projectId);
}
