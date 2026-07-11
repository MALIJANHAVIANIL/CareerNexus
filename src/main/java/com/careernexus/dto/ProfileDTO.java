package com.careernexus.dto;

import com.careernexus.entity.Role;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public final class ProfileDTO {
    private ProfileDTO() {}

    public record UserProfileResponse(
        Long id,
        String email,
        String fullName,
        Role role
    ) {}

    public record StudentProfileRequest(
        String rollNumber,
        String department,
        Double cgpa,
        Integer graduationYear,
        String skills,
        String summary,
        String internships,
        String projects,
        String languages,
        String certifications,
        String socials,
        String resumeName,
        String resumeSize,
        String resumeUploaded
    ) {}

    public record StudentProfileResponse(
        Long id,
        UserProfileResponse user,
        String rollNumber,
        String department,
        Double cgpa,
        Integer graduationYear,
        String skills,
        String summary,
        String internships,
        String projects,
        String languages,
        String certifications,
        String socials,
        String resumeName,
        String resumeSize,
        String resumeUploaded
    ) {}

    public record AlumniProfileRequest(
        String currentCompany,
        String currentRole,
        Integer graduationYear,
        String department,
        String industry,
        String summary,
        String internships,
        String projects,
        String languages,
        String certifications,
        String socials
    ) {}

    public record AlumniProfileResponse(
        Long id,
        UserProfileResponse user,
        String currentCompany,
        String currentRole,
        Integer graduationYear,
        String department,
        String industry,
        String summary,
        String internships,
        String projects,
        String languages,
        String certifications,
        String socials
    ) {}

    public record HrProfileRequest(
        Long companyId,
        String companyName,

        @NotBlank(message = "Designation is required")
        String designation
    ) {}

    public record HrProfileResponse(
        Long id,
        UserProfileResponse user,
        Long companyId,
        String companyName,
        String designation
    ) {}

    public record AdminProfileRequest(
        @NotBlank(message = "Department is required")
        String department
    ) {}

    public record AdminProfileResponse(
        Long id,
        UserProfileResponse user,
        String department
    ) {}
}
