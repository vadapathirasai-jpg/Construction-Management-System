package com.cms.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.cms.entity.Attendance;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, String> {

    boolean existsByWorkerIdAndDate(String workerId, LocalDate date);

    Optional<Attendance> findByWorkerIdAndDate(String workerId, LocalDate date);

    List<Attendance> findByDate(LocalDate date);

    List<Attendance> findByProject(String project);

    List<Attendance> findByWorkerId(String workerId);

    List<Attendance> findByStatus(String status);

    long countByDateAndStatus(LocalDate date, String status);

    long countByDate(LocalDate date);
}
