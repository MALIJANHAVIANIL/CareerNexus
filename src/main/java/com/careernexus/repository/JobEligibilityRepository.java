package com.careernexus.repository;

import com.careernexus.entity.JobEligibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobEligibilityRepository extends JpaRepository<JobEligibility, Long> {
}
