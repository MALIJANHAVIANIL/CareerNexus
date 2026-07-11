package com.careernexus.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.careernexus.entity.MentorshipRequest;

@Repository
public interface MentorshipRequestRepository extends JpaRepository<MentorshipRequest, Long> {
    List<MentorshipRequest> findByStudentId(Long studentId);
    List<MentorshipRequest> findByMentorId(Long mentorId);
    List<MentorshipRequest> findByStudent_User_Id(Long userId);

List<MentorshipRequest> findByMentor_User_Id(Long userId);
}
