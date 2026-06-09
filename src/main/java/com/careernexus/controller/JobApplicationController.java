package com.careernexus.controller;

import com.careernexus.dto.JobApplicationDTO;
import com.careernexus.security.CustomUserDetails;
import com.careernexus.service.JobApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    public JobApplicationController(JobApplicationService jobApplicationService) {
        this.jobApplicationService = jobApplicationService;
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<JobApplicationDTO.JobApplicationResponse> apply(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody JobApplicationDTO.JobApplicationRequest request) {
        return ResponseEntity.ok(jobApplicationService.apply(userDetails.getId(), request));
    }

    @PutMapping("/{applicationId}/status")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<JobApplicationDTO.JobApplicationResponse> updateStatus(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long applicationId,
            @Valid @RequestBody JobApplicationDTO.ApplicationStatusUpdateRequest request) {
        return ResponseEntity.ok(jobApplicationService.updateStatus(userDetails.getId(), applicationId, request));
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<JobApplicationDTO.JobApplicationResponse>> getStudentApplications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(jobApplicationService.getStudentApplications(userDetails.getId()));
    }

    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<List<JobApplicationDTO.JobApplicationResponse>> getJobApplications(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long jobId) {
        return ResponseEntity.ok(jobApplicationService.getJobApplications(userDetails.getId(), jobId));
    }
}
