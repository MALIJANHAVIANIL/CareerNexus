package com.careernexus.service;

import com.careernexus.dto.ResumeDTO;

import java.util.List;

public interface ResumeService {

    ResumeDTO.ResumeResponse createResume(
            Long studentUserId,
            ResumeDTO.ResumeRequest request
    );

    List<ResumeDTO.ResumeResponse> getMyResumes(
            Long studentUserId
    );

    ResumeDTO.ResumeResponse getResume(Long resumeId);

    void deleteResume(
            Long studentUserId,
            Long resumeId
    );
}