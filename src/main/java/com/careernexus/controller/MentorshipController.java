package com.careernexus.controller;

import com.careernexus.dto.MentorshipDTO;
import com.careernexus.security.CustomUserDetails;
import com.careernexus.service.MentorshipService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mentorship")
public class MentorshipController {

    private final MentorshipService mentorshipService;

    public MentorshipController(MentorshipService mentorshipService) {
        this.mentorshipService = mentorshipService;
    }

    @PostMapping("/request")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<MentorshipDTO.MentorshipResponseDTO> requestMentorship(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody MentorshipDTO.MentorshipRequestDTO request) {
        return ResponseEntity.ok(mentorshipService.requestMentorship(userDetails.getId(), request));
    }

    @PutMapping("/request/{requestId}/respond")
    @PreAuthorize("hasRole('ALUMNI')")
    public ResponseEntity<MentorshipDTO.MentorshipResponseDTO> respondToRequest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long requestId,
            @Valid @RequestBody MentorshipDTO.MentorshipActionDTO action) {
        return ResponseEntity.ok(mentorshipService.respondToRequest(userDetails.getId(), requestId, action));
    }

    @GetMapping("/student/requests")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<MentorshipDTO.MentorshipResponseDTO>> getStudentRequests(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(mentorshipService.getStudentRequests(userDetails.getId()));
    }

    @GetMapping("/mentor/requests")
    @PreAuthorize("hasRole('ALUMNI')")
    public ResponseEntity<List<MentorshipDTO.MentorshipResponseDTO>> getMentorRequests(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(mentorshipService.getMentorRequests(userDetails.getId()));
    }
}
