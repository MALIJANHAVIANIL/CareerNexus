package com.careernexus.service;

import java.util.List;

import com.careernexus.dto.JobDTO;

public interface JobService {
    JobDTO.JobResponse postJob(Long hrUserId, JobDTO.JobRequest request);
    JobDTO.JobResponse getJob(Long jobId);
    List<JobDTO.JobResponse> getAllJobs();
    List<JobDTO.JobResponse> getJobsByCompany(Long companyId);
    JobDTO.JobResponse updateJob(Long hrUserId, Long jobId, JobDTO.JobRequest request);
    
    void deleteJob(Long hrUserId, Long jobId);

    // Saved Jobs operations
    void saveJob(Long studentUserId, Long jobId);
    void unsaveJob(Long studentUserId, Long jobId);
    List<JobDTO.JobResponse> getSavedJobs(Long studentUserId);
}
