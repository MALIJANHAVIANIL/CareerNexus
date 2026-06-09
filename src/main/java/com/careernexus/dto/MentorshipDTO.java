package com.careernexus.dto;

import com.careernexus.entity.MentorshipStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public final class MentorshipDTO {
    private MentorshipDTO() {}

    public record MentorshipRequestDTO(
        @NotNull(message = "Mentor ID is required")
        Long mentorId,

        @NotBlank(message = "Message is required")
        String message
    ) {}

    public record MentorshipResponseDTO(
        Long id,
        Long studentId,
        String studentName,
        Long mentorId,
        String mentorName,
        MentorshipStatus status,
        String message,
        String response,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
    ) {}

    public record MentorshipActionDTO(
        @NotNull(message = "Status is required")
        MentorshipStatus status, // APPROVED or REJECTED

        String response
    ) {}
}
