package com.careernexus.service;

import com.careernexus.dto.InterviewExperienceDTO;

import java.util.List;

public interface InterviewExperienceService {

    InterviewExperienceDTO.ExperienceResponse shareExperience(
            Long userId,
            InterviewExperienceDTO.ExperienceRequest request);

    List<InterviewExperienceDTO.ExperienceResponse> getCompanyExperiences(Long companyId);

    List<InterviewExperienceDTO.ExperienceResponse> getAllExperiences();
}