package com.careernexus.dto;

import java.time.LocalDateTime;

public final class AuditLogDTO {
    private AuditLogDTO() {}

    public record AuditLogResponse(
        Long id,
        String action,
        Long userId,
        String userEmail,
        LocalDateTime timestamp,
        String details
    ) {}
}
