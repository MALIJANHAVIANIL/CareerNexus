package com.careernexus.controller;

import com.careernexus.dto.InterviewExperienceDTO;
import com.careernexus.security.CustomUserDetails;
import com.careernexus.service.InterviewExperienceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interview-experiences")
public class InterviewExperienceController {

    private final InterviewExperienceService interviewExperienceService;

    public InterviewExperienceController(
            InterviewExperienceService interviewExperienceService) {
        this.interviewExperienceService = interviewExperienceService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT','ALUMNI')")
    public ResponseEntity<InterviewExperienceDTO.ExperienceResponse> shareExperience(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody InterviewExperienceDTO.ExperienceRequest request) {

        return ResponseEntity.ok(
                interviewExperienceService.shareExperience(
                        userDetails.getId(),
                        request
                )
        );
    }

    @GetMapping
    public ResponseEntity<List<InterviewExperienceDTO.ExperienceResponse>>
    getAllExperiences() {

        return ResponseEntity.ok(
                interviewExperienceService.getAllExperiences()
        );
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<InterviewExperienceDTO.ExperienceResponse>>
    getCompanyExperiences(@PathVariable Long companyId) {

        return ResponseEntity.ok(
                interviewExperienceService.getCompanyExperiences(companyId)
        );
    }
}