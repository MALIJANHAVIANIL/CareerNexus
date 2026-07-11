package com.careernexus.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.careernexus.entity.HrProfile;

@Repository
public interface HrProfileRepository extends JpaRepository<HrProfile, Long> {

    Optional<HrProfile> findByUserId(Long userId);

}