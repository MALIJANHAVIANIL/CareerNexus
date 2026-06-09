package com.careernexus.service;

import com.careernexus.dto.JobApplicationDTO;

import java.util.List;

public interface JobApplicationService {
    JobApplicationDTO.JobApplicationResponse apply(Long studentUserId, JobApplicationDTO.JobApplicationRequest request);
    JobApplicationDTO.JobApplicationResponse updateStatus(Long hrUserId, Long applicationId, JobApplicationDTO.ApplicationStatusUpdateRequest request);
    List<JobApplicationDTO.JobApplicationResponse> getStudentApplications(Long studentUserId);
    List<JobApplicationDTO.JobApplicationResponse> getJobApplications(Long hrUserId, Long jobId);
}
