package com.careernexus.dto;

import com.careernexus.entity.JobApplicationStatus;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public final class JobApplicationDTO {
    private JobApplicationDTO() {}

    public record JobApplicationRequest(
        @NotNull(message = "Job ID is required")
        Long jobId,

        @NotNull(message = "Resume ID is required")
        Long resumeId
    ) {}

    public record JobApplicationResponse(
        Long id,
        Long jobId,
        String jobTitle,
        String companyName,
        Long studentId,
        String studentName,
        Long resumeId,
        String resumeFileName,
        JobApplicationStatus status,
        String feedback,
        LocalDateTime appliedAt
    ) {}

    public record ApplicationStatusUpdateRequest(
        @NotNull(message = "Status is required")
        JobApplicationStatus status,

        String feedback
    ) {}
}
