package com.careernexus.repository;

import com.careernexus.entity.AlumniProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.List;

@Repository
public interface AlumniProfileRepository extends JpaRepository<AlumniProfile, Long> {

    Optional<AlumniProfile> findByUserId(Long userId);

    @Query("SELECT COUNT(ap) FROM AlumniProfile ap WHERE ap.user.isVerified = true")
    long countVerifiedAlumni();

    @Query("SELECT ap FROM AlumniProfile ap WHERE ap.user.isVerified = false")
    List<AlumniProfile> findPendingAlumni();
}