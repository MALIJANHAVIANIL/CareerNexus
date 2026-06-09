package com.careernexus.service;

import com.careernexus.dto.MentorshipDTO;

import java.util.List;

public interface MentorshipService {
    MentorshipDTO.MentorshipResponseDTO requestMentorship(Long studentUserId, MentorshipDTO.MentorshipRequestDTO request);
    MentorshipDTO.MentorshipResponseDTO respondToRequest(Long alumniUserId, Long requestId, MentorshipDTO.MentorshipActionDTO action);
    List<MentorshipDTO.MentorshipResponseDTO> getStudentRequests(Long studentUserId);
    List<MentorshipDTO.MentorshipResponseDTO> getMentorRequests(Long alumniUserId);
}
