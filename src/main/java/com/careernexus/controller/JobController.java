package com.careernexus.controller;

import com.careernexus.dto.JobDTO;
import com.careernexus.security.CustomUserDetails;
import com.careernexus.service.JobService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<JobDTO.JobResponse> postJob(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody JobDTO.JobRequest request) {
        return ResponseEntity.ok(jobService.postJob(userDetails.getId(), request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobDTO.JobResponse> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobService.getJob(id));
    }

    @GetMapping
    public ResponseEntity<List<JobDTO.JobResponse>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<JobDTO.JobResponse>> getJobsByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(jobService.getJobsByCompany(companyId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR', 'ADMIN')")
    public ResponseEntity<Void> deleteJob(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        jobService.deleteJob(userDetails.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{jobId}/save")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> saveJob(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long jobId) {
        jobService.saveJob(userDetails.getId(), jobId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
@PreAuthorize("hasRole('HR')")
public ResponseEntity<JobDTO.JobResponse> updateJob(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long id,
        @Valid @RequestBody JobDTO.JobRequest request) {

    return ResponseEntity.ok(
            jobService.updateJob(userDetails.getId(), id, request)
    );
}
    

    @DeleteMapping("/{jobId}/save")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> unsaveJob(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long jobId) {
        jobService.unsaveJob(userDetails.getId(), jobId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/saved")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<JobDTO.JobResponse>> getSavedJobs(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(jobService.getSavedJobs(userDetails.getId()));
    }
}
