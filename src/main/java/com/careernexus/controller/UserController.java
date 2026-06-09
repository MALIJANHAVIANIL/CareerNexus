package com.careernexus.controller;

import com.careernexus.dto.ProfileDTO;
import com.careernexus.security.CustomUserDetails;
import com.careernexus.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

 // Student profile endpoints

    @GetMapping("/profile/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ProfileDTO.StudentProfileResponse> getStudentProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        return ResponseEntity.ok(
                userService.getStudentProfile(userDetails.getId())
        );
    }

    @PutMapping("/profile/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ProfileDTO.StudentProfileResponse> updateStudentProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ProfileDTO.StudentProfileRequest request) {

        return ResponseEntity.ok(
                userService.updateStudentProfile(userDetails.getId(), request)
        );
    }

    // Alumni profile endpoints
    @GetMapping("/profile/alumni")
    @PreAuthorize("hasRole('ALUMNI')")
    public ResponseEntity<ProfileDTO.AlumniProfileResponse> getAlumniProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getAlumniProfile(userDetails.getId()));
    }

    @PutMapping("/profile/alumni")
    @PreAuthorize("hasRole('ALUMNI')")
    public ResponseEntity<ProfileDTO.AlumniProfileResponse> updateAlumniProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ProfileDTO.AlumniProfileRequest request) {
        return ResponseEntity.ok(userService.updateAlumniProfile(userDetails.getId(), request));
    }

    // HR profile endpoints
    @GetMapping("/profile/hr")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ProfileDTO.HrProfileResponse> getHrProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getHrProfile(userDetails.getId()));
    }

    @PutMapping("/profile/hr")
    @PreAuthorize("hasRole('HR')")
    public ResponseEntity<ProfileDTO.HrProfileResponse> updateHrProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ProfileDTO.HrProfileRequest request) {
        return ResponseEntity.ok(userService.updateHrProfile(userDetails.getId(), request));
    }

    // Admin profile endpoints
    @GetMapping("/profile/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProfileDTO.AdminProfileResponse> getAdminProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getAdminProfile(userDetails.getId()));
    }

    @PutMapping("/profile/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProfileDTO.AdminProfileResponse> updateAdminProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ProfileDTO.AdminProfileRequest request) {
        return ResponseEntity.ok(userService.updateAdminProfile(userDetails.getId(), request));
    }
}
