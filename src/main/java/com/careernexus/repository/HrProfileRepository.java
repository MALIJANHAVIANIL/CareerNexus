package com.careernexus.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.careernexus.entity.HrProfile;

@Repository
public interface HrProfileRepository extends JpaRepository<HrProfile, Long> {

    Optional<HrProfile> findByUserId(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT hp FROM HrProfile hp WHERE hp.user.isVerified = false")
    java.util.List<HrProfile> findPendingHr();
}