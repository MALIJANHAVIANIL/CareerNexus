package com.careernexus.service;

import com.careernexus.dto.JobDTO;

import java.util.List;

public interface JobService {
    JobDTO.JobResponse postJob(Long hrUserId, JobDTO.JobRequest request);
    JobDTO.JobResponse getJob(Long jobId);
    List<JobDTO.JobResponse> getAllJobs();
    List<JobDTO.JobResponse> getJobsByCompany(Long companyId);
    void deleteJob(Long hrUserId, Long jobId);

    // Saved Jobs operations
    void saveJob(Long studentUserId, Long jobId);
    void unsaveJob(Long studentUserId, Long jobId);
    List<JobDTO.JobResponse> getSavedJobs(Long studentUserId);
}
