package com.careernexus.repository;

import com.careernexus.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.careernexus.entity.JobApplicationStatus;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

    Optional<StudentProfile> findByRollNumber(String rollNumber);

    Optional<StudentProfile> findByUserId(Long userId);

    @Query("SELECT COUNT(DISTINCT sp) FROM StudentProfile sp JOIN sp.jobApplications ja WHERE ja.status = :status")
    long countUniqueStudentsWithApplicationStatus(@Param("status") JobApplicationStatus status);
}