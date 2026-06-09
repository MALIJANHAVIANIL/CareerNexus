package com.careernexus.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public final class EventDTO {
    private EventDTO() {}

    public record EventRequest(
        @NotBlank(message = "Title is required")
        String title,

        @NotBlank(message = "Description is required")
        String description,

        Long companyId, // Nullable

        @NotBlank(message = "Speaker details are required")
        String speaker,

        @NotNull(message = "Start time is required")
        @Future(message = "Start time must be in the future")
        LocalDateTime startTime,

        @NotNull(message = "End time is required")
        LocalDateTime endTime,

        @NotBlank(message = "Location/Link is required")
        String location
    ) {}

    public record EventResponse(
        Long id,
        String title,
        String description,
        Long companyId,
        String companyName,
        String speaker,
        LocalDateTime startTime,
        LocalDateTime endTime,
        String location,
        LocalDateTime createdAt
    ) {}
}
