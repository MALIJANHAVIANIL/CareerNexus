package com.careernexus.dto;

public final class TpoDTO {
    private TpoDTO() {}

    public record TpoStatsResponse(
        int placementRate,
        long placedStudents,
        long activeRecruiters,
        long approvedMentors
    ) {}

    public record AlumniVerificationResponse(
        Long id,
        String name,
        String email,
        String company,
        String designation,
        Integer graduationYear,
        String prn
    ) {}

    public record HrAssignmentRequest(
        @jakarta.validation.constraints.NotNull(message = "HR User ID is required")
        Long hrUserId,
        @jakarta.validation.constraints.NotNull(message = "Company ID is required")
        Long companyId
    ) {}

    public record StudentTpoResponse(
        Long id,
        String name,
        String email,
        String rollNumber,
        String department,
        Double cgpa,
        Integer graduationYear,
        String placementStatus
    ) {}

    public record AlumniTpoResponse(
        Long id,
        String name,
        String email,
        String company,
        String role,
        Integer graduationYear,
        boolean isVerified
    ) {}
}
