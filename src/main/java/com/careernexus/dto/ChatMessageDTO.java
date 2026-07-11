package com.careernexus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

import java.time.LocalDateTime;

public final class ChatMessageDTO {
    private ChatMessageDTO() {}

    public record ChatRequest(
        @NotNull(message = "Recipient ID is required")
        Long recipientId,

        @NotBlank(message = "Content cannot be empty")
        String content
    ) {}

    public record ChatResponse(
        Long id,
        Long senderId,
        String senderName,
        Long recipientId,
        String recipientName,
        String content,
        LocalDateTime timestamp
    ) {}

    public record ConversationResponse(
        String chatId,
        Long studentId,
        String studentName,
        String studentAvatar,
        String studentTitle,
        Long mentorId,
        String mentorName,
        String mentorAvatar,
        String mentorTitle,
        List<ChatResponse> messages
    ) {}
}
