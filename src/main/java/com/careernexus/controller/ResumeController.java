package com.careernexus.controller;

import com.careernexus.dto.ResumeDTO;
import com.careernexus.security.CustomUserDetails;
import com.careernexus.service.ResumeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ResumeDTO.ResumeResponse> createResume(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ResumeDTO.ResumeRequest request) {

        return ResponseEntity.ok(
                resumeService.createResume(
                        userDetails.getId(),
                        request
                )
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ResumeDTO.ResumeResponse>> getMyResumes(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        return ResponseEntity.ok(
                resumeService.getMyResumes(userDetails.getId())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResumeDTO.ResumeResponse> getResume(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                resumeService.getResume(id)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> deleteResume(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {

        resumeService.deleteResume(
                userDetails.getId(),
                id
        );

        return ResponseEntity.noContent().build();
    }
}