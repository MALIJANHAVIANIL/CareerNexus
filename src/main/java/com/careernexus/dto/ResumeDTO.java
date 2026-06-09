package com.careernexus.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public final class ResumeDTO {

    private ResumeDTO() {}

    public record ResumeRequest(

            @NotBlank(message = "Resume URL is required")
            String resumeUrl,

            @NotBlank(message = "File name is required")
            String fileName,

            boolean isPrimary
    ) {}

    public record ResumeResponse(
            Long id,
            String resumeUrl,
            String fileName,
            boolean isPrimary,
            LocalDateTime createdAt
    ) {}
}