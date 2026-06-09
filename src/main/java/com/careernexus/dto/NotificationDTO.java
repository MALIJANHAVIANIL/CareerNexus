package com.careernexus.dto;

import com.careernexus.entity.NotificationType;

import java.time.LocalDateTime;

public final class NotificationDTO {
    private NotificationDTO() {}

    public record NotificationResponse(
        Long id,
        Long recipientId,
        String message,
        boolean isRead,
        NotificationType type,
        LocalDateTime createdAt
    ) {}
}
