package com.careernexus.repository;

import com.careernexus.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {

    Optional<StudentProfile> findByRollNumber(String rollNumber);

    Optional<StudentProfile> findByUserId(Long userId);
}