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
        @NotBlank(message = "Roll number is required")
        String rollNumber,

        @NotBlank(message = "Department is required")
        String department,

        @NotNull(message = "CGPA is required")
        @DecimalMin(value = "0.0")
        @DecimalMax(value = "10.0")
        Double cgpa,

        @NotNull(message = "Graduation year is required")
        @Min(1900)
        Integer graduationYear,

        String skills
    ) {}

    public record StudentProfileResponse(
        Long id,
        UserProfileResponse user,
        String rollNumber,
        String department,
        Double cgpa,
        Integer graduationYear,
        String skills
    ) {}

    public record AlumniProfileRequest(
        @NotBlank(message = "Current company is required")
        String currentCompany,

        @NotBlank(message = "Current role is required")
        String currentRole,

        @NotNull(message = "Graduation year is required")
        @Min(1900)
        Integer graduationYear,

        @NotBlank(message = "Department is required")
        String department,

        String industry
    ) {}

    public record AlumniProfileResponse(
        Long id,
        UserProfileResponse user,
        String currentCompany,
        String currentRole,
        Integer graduationYear,
        String department,
        String industry
    ) {}

    public record HrProfileRequest(
        @NotNull(message = "Company ID is required")
        Long companyId,

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
