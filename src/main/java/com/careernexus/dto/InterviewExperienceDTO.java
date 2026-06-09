package com.careernexus.dto;

import com.careernexus.entity.InterviewDifficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public final class InterviewExperienceDTO {

    private InterviewExperienceDTO() {
    }

    public record ExperienceRequest(

            @NotNull(message = "Company ID is required")
            Long companyId,

            @NotBlank(message = "Role is required")
            String role,

            @NotBlank(message = "Experience is required")
            String experience,

            @NotNull(message = "Difficulty is required")
            InterviewDifficulty difficulty,

            @NotNull(message = "Rounds count is required")
            Integer rounds,

            boolean isAnonymous
    ) {
    }

    public record ExperienceResponse(
            Long id,
            Long userId,
            String userName,
            Long companyId,
            String companyName,
            String role,
            String experience,
            InterviewDifficulty difficulty,
            Integer rounds,
            boolean isAnonymous,
            LocalDateTime createdAt
    ) {
    }
}