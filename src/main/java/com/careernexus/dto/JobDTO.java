package com.careernexus.dto;

import com.careernexus.entity.JobType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public final class JobDTO {

    private JobDTO() {
    }

    // =========================
    // Job Eligibility DTO
    // =========================
    public record JobEligibilityDTO(

            Double minimumCgpa,

            String eligibleDepartments,

            String graduationYears,

            boolean backlogsAllowed,

            Double minimumTenthPercentage,

            Double minimumTwelfthPercentage,

            Integer allowedGapYears,

            Boolean bondRequired,

            String bondDuration

    ) {
    }

    // =========================
    // Create Job Request
    // =========================
    public record JobRequest(

            @NotBlank(message = "Job title is required")
            String title,

            @NotBlank(message = "Job description is required")
            String description,

            @NotNull(message = "Company ID is required")
            Long companyId,

            @NotBlank(message = "Location is required")
            String location,

            String salaryRange,

            @NotNull(message = "Job type is required")
            JobType jobType,

            @NotNull(message = "Deadline is required")
            @Future(message = "Deadline must be in the future")
            LocalDateTime deadline,

            JobEligibilityDTO eligibility

    ) {
    }

    // =========================
    // Job Response
    // =========================
    public record JobResponse(

        Long id,
        String title,
        String description,

        Long companyId,
        String companyName,

        Long postedByHrId,
        String postedByHrName,

        String location,
        String salaryRange,

        String experience,
        String workMode,
        Integer openings,
        String companyLogo,

        JobType jobType,

        LocalDateTime createdAt,
        LocalDateTime deadline,

        Integer totalApplications,

        JobEligibilityDTO eligibility

) {
} 
}